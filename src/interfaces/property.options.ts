import { MethodType, SortOptions } from '@standardkit/nest-architect';
import { Method } from '../constants';

export interface PropertyOptions<T> {
  // Documentation
  description?: string;
  example?: T;
  default?: T;

  // Validation
  enum?: string[] | Record<string, string | number>;
  min?: number;
  max?: number;
  pattern?: RegExp;

  // Query
  sortable?: boolean;
  sortOptions?: SortOptions;
  filterable?: boolean;
  searchable?: boolean;

  // Access
  expose?: boolean | MethodType[];
  nullable?: boolean | typeof Method.Create | typeof Method.Update;
  fillable?: boolean | typeof Method.Create | typeof Method.Update;
  required?: boolean | typeof Method.Create | typeof Method.Update;
}
