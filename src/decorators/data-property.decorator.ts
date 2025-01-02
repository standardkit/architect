import { GenericProperty, MetadataProperty, PropertyOptions } from '@standardkit/nest-architect';

export function DataProperty<T>(options: PropertyOptions<T> = {}): PropertyDecorator {
  return GenericProperty(MetadataProperty.DataProperty, options);
}
