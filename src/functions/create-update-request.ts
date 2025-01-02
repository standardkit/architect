import { Type } from '@nestjs/common';
import { Method } from '../constants';
import { ScopeType } from '../types';
import { defineRequestProperties } from './define-request-properties';
import { defineRequestRelations } from './define-request-relations';

export function createUpdateRequest<Entity>(entity: Type<Entity>, scope: ScopeType<Entity>[] = []): any {
  class UpdateRequest {}

  defineRequestProperties(UpdateRequest, entity, Method.Update);
  defineRequestRelations(UpdateRequest, entity, Method.Update, scope);

  return UpdateRequest;
}
