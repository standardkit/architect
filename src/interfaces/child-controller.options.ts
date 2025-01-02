import { Type } from '@nestjs/common';
import { MethodType, ScopeType } from '../types';
import { KeyOf } from '@standardkit/core';

export interface ChildControllerOptions<Parent, Entity, Junction = any> {
  // Junctions
  multi?: boolean;
  through?: Type<Junction> | KeyOf<Entity>;
  include?: KeyOf<Junction>[];

  // Method Access
  exclude?: MethodType[];
  readOnly?: boolean;

  // Overrides
  decorators?: MethodDecorator[];
  methodDecorators?: Partial<Record<MethodType, MethodDecorator[]>>;

  // Scope Access
  scope?: ScopeType<Entity>[];
  parentScope?: ScopeType<Parent>[];

  // Naming
  prefix?: string;
  name?: string;
  plural?: string;
  parentName?: string;
  parentPlural?: string;
}
