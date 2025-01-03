import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { entries } from '@standardkit/core';
import { Method } from '../constants';
import { DataProperties, MethodType } from '../types';
import { getDataProperties } from './get-data-properties';
import { trueOrMethodIncluded } from './method-option.helpers';

export function defineResponseDataProperties<Entity>(
  request: Type,
  entity: Type<Entity>,
  method: Omit<MethodType, typeof Method.Delete>,
): void {
  const properties: DataProperties<Entity> = getDataProperties(entity);

  entries(properties).forEach(([field, config]) => {
    if (!trueOrMethodIncluded(method as MethodType, config.expose)) return;

    // TODO : Fully implement
    // TODO : Check all fields of config
    ApiProperty({
      type: () => config.type,
      example: config.example,
      description: config.description,
    })(request.prototype, field);
  });
}
