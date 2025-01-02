import { DataRelationOptions } from '../interfaces';
import { KeyOf } from '@standardkit/core';

export type DataRelations<Entity> = Partial<{ [Key in KeyOf<Entity>]: DataRelationOptions }>;
