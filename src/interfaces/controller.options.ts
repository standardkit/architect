import { List } from '@standardkit/core';
import { MethodType, ScopeType } from '../types';

export interface ControllerOptions<Entity> {
  exclude?: MethodType[];
  readOnly?: boolean;
  decorators?: MethodDecorator[];
  methodDecorators?: List<MethodType, MethodDecorator[]>;
  scope?: ScopeType<Entity>[];
  name?: string;
  prefix?: string;
  plural?: string;
}
