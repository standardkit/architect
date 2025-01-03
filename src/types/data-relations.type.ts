import { KeyOf } from '@standardkit/core';
import { DataRelationOptions } from '../interfaces';

export type DataRelations<Entity> = Partial<{ [Key in KeyOf<Entity>]: DataRelationOptions }>;
