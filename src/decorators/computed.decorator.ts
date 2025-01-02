import { MetadataProperty } from '../constants';
import { ComputedOptions } from '../interfaces';
import { GenericProperty } from './property.decorator';

export function DataComputed(options: ComputedOptions = {}): PropertyDecorator {
  return GenericProperty(MetadataProperty.DataComputed, options);
}
