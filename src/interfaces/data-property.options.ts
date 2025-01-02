import { PropertyOptions } from './property.options';

export interface DataPropertyOptions<T> extends PropertyOptions<T> {
  type: T;
}
