import { DataPropertyOptions } from '../interfaces';
import { KeyOf } from '@standardkit/core';

export type DataProperties<Entity> = Partial<{ [Key in KeyOf<Entity>]: DataPropertyOptions<Entity[Key]> }>;
