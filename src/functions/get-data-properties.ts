import { EntityKey, EntityMetadata, EntityProperty, MetadataStorage, ReferenceKind } from '@mikro-orm/core';
import { Type } from '@nestjs/common';
import { Method } from '../constants';
import { getPropertyMetadata } from '../decorators';
import { PropertyOptions } from '../interfaces';
import { DataProperties } from '../types';
import { getPropertyType } from './get-property-type';
import { entries, KeyOf } from '@standardkit/core';

function hasDefault<Entity>(entity: Type<Entity>, field: EntityKey<Entity>): boolean {
  return entity.toString().includes(`this.${field} =`);
}

function getNullable<Entity, Field extends KeyOf<Entity>>(
  ormOptions: EntityProperty<Entity, Field>,
  hasInitializer: boolean,
): boolean | typeof Method.Create | typeof Method.Update {
  return !ormOptions.nullable && !hasInitializer ? Method.Update : true;
}

function getRequired<Entity, Field extends KeyOf<Entity>>(
  property: EntityProperty<Entity, Field>,
  hasInitializer: boolean,
): boolean | typeof Method.Create | typeof Method.Update {
  return !property.nullable && !hasInitializer ? Method.Create : false;
}

function getExample<T>(type: Type, possibleValues?: T[] | Record<string, T>): T {
  if (possibleValues) {
    return Array.isArray(possibleValues) ? possibleValues[0] : Object.values(possibleValues)[0];
  }
  switch (type) {
    case String:
      return 'abc123' as T;
    case Date:
      return new Date() as T;
    case Number:
      return 1 as T;
    case Boolean:
      return true as T;
  }
}

function getFilterable<Entity>(options: EntityProperty, userOptions: PropertyOptions<Entity>, type: Type): boolean {
  return !!options?.enum || !!userOptions?.enum || type === Date || type === Number || type === Boolean;
}

export function getDataProperties<Entity>(entity: Type<Entity>): DataProperties<Entity> {
  const entityMetadata: EntityMetadata<Entity> = Object.values(MetadataStorage.getMetadata()).find(
    (entityMetadata: EntityMetadata) => entityMetadata.name === entity.name,
  );
  const dataProperties: any = {};

  entries(entityMetadata.properties).forEach(([field, entityProperty]) => {
    if (entityProperty.kind !== ReferenceKind.SCALAR) return;

    const userOptions: PropertyOptions<Entity[typeof field]> = getPropertyMetadata(entity, field);

    const hasInitializer: boolean = hasDefault(entity, field);
    const propertyType = getPropertyType(entity, field);

    dataProperties[field] = {
      type: propertyType,

      example: getExample(propertyType, userOptions?.enum) as Entity[typeof field],
      default: entityProperty.default as Entity[typeof field],
      sortable: field !== 'id',
      filterable: getFilterable(entityProperty, userOptions, propertyType),
      nullable: getNullable(entityProperty, hasInitializer),
      expose: userOptions?.expose ?? true,
      fillable: !hasInitializer,
      required: getRequired(entityProperty, hasInitializer),

      ...userOptions,
    };
  });

  return dataProperties as DataProperties<Entity>;
}
