import { Type } from '@nestjs/common';
import { Method } from '../constants';
import { ScopeType } from '../types';
import { defineRequestProperties } from './define-request-properties';
import { defineRequestRelations } from './define-request-relations';

export function createPostRequest<Entity>(entity: Type<Entity>, scope: ScopeType<Entity>[] = []): any {
  class CreateRequest {}

  defineRequestProperties(CreateRequest, entity, Method.Create);
  defineRequestRelations(CreateRequest, entity, Method.Create, scope);

  return CreateRequest;
}
