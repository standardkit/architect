import { Type } from '@nestjs/common';
import { entries, fromEntries } from '@standardkit/core';
import { DataRelations, ScopeType } from '../types';
import { getDataRelations } from './get-data-relations';
import { getScopedFields } from './get-scoped-fields';

export function getFilterableRelations<Entity>(
  entity: Type<Entity>,
  scope: ScopeType<Entity>[] = [],
): DataRelations<Entity> {
  const relations: DataRelations<Entity> = getDataRelations<Entity>(entity);
  const scopedFields = getScopedFields(scope);

  const filterableRelations = entries(relations).filter(
    ([field, config]) => config.filterable && !scopedFields.includes(field),
  );

  return fromEntries(filterableRelations);
}
