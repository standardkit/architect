import { FilterOperatorType, KeyOf } from '@standardkit/core';

export type RawFilter = Partial<{ [Operator in FilterOperatorType]: string | number }>;

export type RawFilters<Entity> = Partial<{ [Key in KeyOf<Entity>]: RawFilter | string }>;
