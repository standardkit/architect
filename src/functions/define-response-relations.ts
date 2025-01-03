import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { entries } from '@standardkit/core';
import { Method } from '../constants';
import { DataRelations, MethodType } from '../types';
import { createEntityResponse } from './create-entity-response';
import { getDataRelations } from './get-data-relations';
import { getRelationField } from './get-relation-field';
import { trueOrMethodIncluded } from './method-option.helpers';

export function defineResponseRelations<Entity>(
  response: Type,
  entity: Type<Entity>,
  method: Omit<MethodType, typeof Method.Delete>,
  isNested: boolean = false,
): void {
  const relationProperties: DataRelations<Entity> = getDataRelations(entity);

  entries(relationProperties).forEach(([field, options]) => {
    if (!isNested && trueOrMethodIncluded(method as MethodType, options.populate)) {
      ApiProperty({
        isArray: true,
        type: () => createEntityResponse(options.type, Method.GetMany, options.type.name, true),
      })(response.prototype, field);
    }

    if (trueOrMethodIncluded(method as MethodType, options.expose)) {
      const name = getRelationField(field, options);
      const key = `${name}Id`;
      ApiProperty({
        type: String,
        description: `ID of the ${name}`,
        example: 'abc123',
      })(response.prototype, key);
    }
  });
}
