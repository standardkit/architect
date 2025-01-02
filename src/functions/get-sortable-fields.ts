import { Type } from '@nestjs/common';
import { entries, KeyOf } from '@standardkit/core';
import { getDataProperties } from '@standardkit/nest-architect';

export function getSortableFields<Entity>(entity: Type<Entity>): KeyOf<Entity>[] {
  const properties = getDataProperties<Entity>(entity);

  return entries(properties)
    .filter(([_field, config]) => config.sortable)
    .map(([field, _config]) => field);
}
