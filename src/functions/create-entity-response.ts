import { Type } from '@nestjs/common';
import { capitalize } from '@standardkit/caas';
import { Method, MethodType } from '@standardkit/nest-architect';
import { defineResponseDataProperties } from './define-response-properties';
import { defineResponseRelations } from './define-response-relations';

function getClassName(entityName: string, method: Omit<MethodType, typeof Method.Delete>): string {
  switch (method) {
    case Method.Create:
    case Method.Update:
      return `${capitalize(String(method))}${entityName}Response`;
    case Method.GetOne:
      return `Get${entityName}Response`;
    case Method.GetMany:
      return `${entityName}Data`;
  }
}

export function createEntityResponse<Entity>(
  entity: Type<Entity>,
  method: Omit<MethodType, typeof Method.Delete>,
  entityName: string,
  isNested: boolean = false,
): Type {
  class EntityResponse {}

  defineResponseDataProperties(EntityResponse, entity, method);

  // TODO : Implement
  // defineResponseDataComputed(EntityResponse, entity, method);

  defineResponseRelations(EntityResponse, entity, method, isNested);

  Object.defineProperty(EntityResponse, 'name', { value: getClassName(entityName, method) });

  return EntityResponse;
}
