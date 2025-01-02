import { EntityKey } from '@mikro-orm/core';
import { Type } from '@nestjs/common';
import { MetadataProperty } from '@standardkit/nest-architect';

export function getPropertyType<Entity>(entity: Type<Entity>, field: EntityKey<Entity>): Type {
  return Reflect.getMetadata(MetadataProperty.DesignType, entity.prototype, field);
}
