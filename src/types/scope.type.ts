import { Type } from '@nestjs/common';
import { KeyOf } from '@standardkit/core';

export type ScopeType<Entity> = Type | KeyOf<Entity>;
