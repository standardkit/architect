import { GenericProperty, MetadataProperty, RelationOptions } from '@standardkit/nest-architect';

export function DataRelation(options: RelationOptions = {}): PropertyDecorator {
  return GenericProperty(MetadataProperty.DataRelation, options);
}
