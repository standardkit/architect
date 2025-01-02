import { BadRequestException, Injectable, PipeTransform, Type } from '@nestjs/common';
import { Separator } from '../constants';
import { FilterOption } from '../dtos';
import { getDataProperties } from '../functions';
import { DataPropertyOptions } from '../interfaces';
import { DataProperties, FilteredRequestType } from '../types';
import { entries, FilterOperator, FilterOperatorType, KeyOf } from '@standardkit/core';

@Injectable()
export class FilterValidationPipe<Entity> implements PipeTransform {
  constructor(private entity: Type<Entity>) {}

  public transform<OtherValues>(
    request: FilteredRequestType<Entity> & OtherValues,
  ): { filter: FilterOption<Entity>[] } & OtherValues {
    const filter = request?.filter;

    if (!request.filter) return { ...request, filter: [] };

    const properties: DataProperties<Entity> = getDataProperties(this.entity);
    const filterableProperties = entries(properties).filter(([_field, options]): boolean => options.filterable);
    const validatedFilters = [];

    entries(filter).forEach(([field, filters]) => {
      // Check for fallback filter `filter[field]=one,two,three`
      if (typeof filters === 'string') {
        filters = { [FilterOperator.In]: filters };
      }

      // Replace `filter[field][]=abc,def` with `filter[field][in]=abc,def`
      entries(filters).forEach(([operator, values]) => {
        if (operator === '0') {
          filters[FilterOperator.In] = values;
          delete filters[operator];
        }
      });

      const filterableDataProperty: [KeyOf<Entity>, DataPropertyOptions<Entity[typeof field]>] =
        filterableProperties.find(([filterableField, _options]) => filterableField === field);

      // TODO : Handle DataRelations as well

      if (!filterableDataProperty || !filterableDataProperty[1]) {
        throw new BadRequestException(`Invalid filter property: ${field}`);
      }

      const filterOptions = this.validateFilters(field, filters, filterableDataProperty[1]);
      validatedFilters.push(...filterOptions);
    });

    return { ...request, filter: validatedFilters };
  }

  private validateFilters(
    field: KeyOf<Entity>,
    filters: any,
    options: DataPropertyOptions<Entity[typeof field]>,
  ): FilterOption<Entity>[] {
    const validatedFilters = [];

    for (const [filter, value] of Object.entries(filters)) {
      if (!this.isValidFilterType(options, filter)) {
        throw new BadRequestException(`Filter type '${filter}' not allowed for property '${String(field)}'`);
      }

      const filterOption = this.validateAndParseValue(options, field, filter as FilterOperatorType, value);
      validatedFilters.push(filterOption);
    }

    return validatedFilters;
  }

  private isValidFilterType(options: DataPropertyOptions<any>, filter: string): boolean {
    switch (options.type) {
      case String:
        return (
          [
            FilterOperator.All,
            FilterOperator.Equals,
            FilterOperator.NotEquals,
            FilterOperator.In,
            FilterOperator.NotIn,
          ] as string[]
        ).includes(filter);
      case Date:
      case Number:
        return (
          [
            FilterOperator.GreaterThan,
            FilterOperator.GreaterThanOrEquals,
            FilterOperator.LessThan,
            FilterOperator.LessThanOrEquals,
          ] as string[]
        ).includes(filter);
      default:
        throw new BadRequestException(`Unsupported filter operator: ${filter}`);
    }
  }

  private validateAndParseValue(
    options: DataPropertyOptions<any>,
    field: KeyOf<Entity>,
    filter: FilterOperatorType,
    value: any,
  ): FilterOption<Entity> {
    const rawValue = value;

    switch (filter) {
      case FilterOperator.Equals:
      case FilterOperator.NotEquals:
        if (!options.enum) break; // TODO : Do based on type in dataproperty?
        if (options.nullable && value === 'null') break;

        if (!Object.values(options.enum).includes(value)) {
          throw new BadRequestException(`Invalid filter value: ${value}`);
        }
        break;
      case FilterOperator.All:
      case FilterOperator.In:
      case FilterOperator.NotIn:
        if (options.nullable && value === 'null') break;
        value = value.split(Separator.Filter);
        if (!options.enum) break; // TODO : Do based on type in dataproperty

        value.forEach((actualValue: any): void => {
          if (!Object.values(options.enum).includes(actualValue)) {
            throw new BadRequestException(`Invalid filter value: ${actualValue}`);
          }
        });
        break;

      case FilterOperator.GreaterThan:
      case FilterOperator.GreaterThanOrEquals:
      case FilterOperator.LessThan:
      case FilterOperator.LessThanOrEquals:
        const isDate = options.type === Date;

        value = isDate ? new Date(value) : Number(value);
        if (isDate && isNaN(value.getTime())) {
          throw new BadRequestException(`Unsupported date value: ${rawValue}`);
        }
        if (!isDate && isNaN(value)) {
          throw new BadRequestException(`Invalid number value: ${rawValue}`);
        }
        break;
    }

    return { field, operator: filter, value };
  }
}
