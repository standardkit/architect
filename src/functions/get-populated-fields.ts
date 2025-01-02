import { Type } from '@nestjs/common';
import { DataRelations, MethodType } from '../types';
import { getDataRelations } from './get-data-relations';
import { trueOrMethodIncluded } from './method-option.helpers';
import { entries, KeyOf } from '@standardkit/core';

export function getPopulatedFields<Entity>(entity: Type<Entity>, method: MethodType): KeyOf<Entity>[] {
  const properties: DataRelations<Entity> = getDataRelations<Entity>(entity);

  return entries(properties)
    .filter(([_field, config]) => trueOrMethodIncluded(method, config.populate))
    .map(([field, _config]) => field);
}
