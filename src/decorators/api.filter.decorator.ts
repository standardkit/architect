import { applyDecorators, Type, UsePipes } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { entries, FilterOperator, KeyOf } from '@standardkit/core';
import { Relation } from '../constants';
import { getDataProperties, getFilterableRelations } from '../functions';
import { getRelationField } from '../functions/get-relation-field';
import { DataPropertyOptions, DataRelationOptions } from '../interfaces';
import { FilterValidationPipe } from '../pipes';
import { DataProperties, RawFilter, RelationType, ScopeType } from '../types';

const ENUM_FILTERS = [
  FilterOperator.All,
  FilterOperator.Equals,
  FilterOperator.NotEquals,
  FilterOperator.In,
  FilterOperator.NotIn,
];

const RANGE_FILTERS = [
  FilterOperator.GreaterThan,
  FilterOperator.GreaterThanOrEquals,
  FilterOperator.LessThan,
  FilterOperator.LessThanOrEquals,
];

function getSimpleExample<Entity>(options: DataPropertyOptions<Entity>): string {
  return options.enum ? Object.values(options.enum).join(',') : ['example1', 'example2'].join(',');
}

function getDescription(options: DataPropertyOptions<any>): string {
  const baseDescription = 'Filter operators:';
  const filters: string[] = [];

  if (options.enum) {
    filters.push(...ENUM_FILTERS);

    return `${baseDescription} '${filters.join("', '")}'. ; Values: ${Object.values(options.enum ?? [])?.join(', ')}`;
  }

  if (options.type === Number || options.type === Date) {
    filters.push(...RANGE_FILTERS);

    return `${baseDescription} '${filters.join("', '")}'`;
  }
}

// TODO : Get example from options?
function getSimpleDescription(options: DataPropertyOptions<any>): string {
  return (
    `Default equality filter (comparable to 'eq' and 'in'). You can omit the empty brackets. Possible values: ` +
    Object.values(options.enum ?? ['example1', 'example2'])?.join(', ')
  );
}

function getExample<Entity>(options: DataPropertyOptions<Entity>): RawFilter {
  if (options.enum) {
    const values = options.enum ? Object.values(options.enum).join(',') : ['example1', 'example2'].join(',');
    const value = options.enum ? Object.values(options.enum)[0] : 'example1';

    return { all: values, in: values, nin: values, eq: value, neq: value };
  }

  switch (options.type) {
    case Number:
      return { gte: 1, lte: 10, gt: 0, lt: 11 };
    case Date:
      const year: number = new Date().getFullYear();
      const start: string = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)).toISOString();
      const end: string = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)).toISOString();

      return { gt: start, gte: start, lt: end, lte: end };
  }

  return {};
}

function createObjectPropertyDecorator<Entity>(
  field: KeyOf<Entity>,
  options: DataPropertyOptions<Entity[typeof field]>,
): MethodDecorator {
  return ApiQuery({
    name: `filter[${field}]`,
    required: false,
    style: 'deepObject',
    description: getDescription(options),
    schema: {
      type: 'object',
      example: getExample(options),
    },
  });
}

function createSimplePropertyDecorator<Entity>(
  field: KeyOf<Entity>,
  options: DataPropertyOptions<Entity[typeof field]>,
): MethodDecorator {
  return ApiQuery({
    name: `filter[${field}][]`,
    required: false,
    description: getSimpleDescription(options),
    schema: {
      type: 'string',
      example: getSimpleExample(options),
    },
  });
}

function createRelationDecorator(field: string, options: DataRelationOptions): MethodDecorator[] {
  const name = getRelationField(field, options);
  const key = `${name}Id`;
  const values = ['abc123', 'def456'].join(',');
  const example = { in: values, nin: values, eq: 'abc123', neq: 'def456' };
  if (([Relation.ManyToMany, Relation.OneToMany] as RelationType[]).includes(options.relation)) {
    example['all'] = values;
  }
  return [
    ApiQuery({
      name: `filter[${key}]`,
      required: false,
      style: 'deepObject',
      schema: { type: 'object', example },
    }),
    ApiQuery({ name: `filter[${key}][]`, required: false, schema: { type: 'string', example: 'abc123' } }),
  ];
}

export function ApiFilter<Entity>(entity: Type<Entity>, scope: ScopeType<Entity>[] = []): MethodDecorator {
  const dataProperties: DataProperties<Entity> = getDataProperties(entity);

  const filterableProperties = entries(dataProperties).filter(([_field, options]): boolean => options.filterable);

  const decorators = filterableProperties.flatMap(([field, options]) => {
    const objectDecorator = createObjectPropertyDecorator<Entity>(field, options);
    if (!options.enum) return [objectDecorator];

    const simpleDecorator = createSimplePropertyDecorator<Entity>(field, options);

    return [objectDecorator, simpleDecorator];
  });

  const filterableRelations = getFilterableRelations(entity, scope);
  const relationDecorators = entries(filterableRelations).flatMap(([field, options]) =>
    createRelationDecorator(field, options),
  );

  return applyDecorators(...decorators, ...relationDecorators, UsePipes(new FilterValidationPipe(entity)));
}
