import { KeyOf } from '@standardkit/core';
import { DataPropertyOptions } from '../interfaces';

export type DataProperties<Entity> = Partial<{ [Key in KeyOf<Entity>]: DataPropertyOptions<Entity[Key]> }>;
