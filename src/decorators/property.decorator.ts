import { EntityKey } from '@mikro-orm/core';
import { Type } from '@nestjs/common';
import { MetadataProperty } from '../constants';
import { PropertyOptions } from '../interfaces';
import { MetadataPropertyType } from '../types';

export function GenericProperty(key: MetadataPropertyType, value?: any): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const properties: Record<string | symbol, any>[] = Reflect.getMetadata(key, target.constructor) ?? {};
    properties[propertyKey] = value;
    Reflect.defineMetadata(key, properties, target.constructor);
  };
}

// TODO : Move to functions
export function getProperties<Entity, Value>(entity: Type<Entity>, option: string): Record<keyof Entity, Value> {
  return Reflect.getMetadata(option, entity) ?? {};
}

// TODO : Move to functions
export function getPropertyMetadata<Entity>(
  entity: Type<Entity>,
  field: EntityKey<Entity>,
): PropertyOptions<Entity[typeof field]> {
  return getProperties<Entity, PropertyOptions<Entity[typeof field]>>(entity, MetadataProperty.DataProperty)[field];
}

// TODO : Move to functions
export function getRelationMetadata<Entity>(
  entity: Type<Entity>,
  field: EntityKey<Entity>,
): PropertyOptions<Entity[typeof field]> {
  return getProperties<Entity, PropertyOptions<Entity[typeof field]>>(entity, MetadataProperty.DataRelation)[field];
}
