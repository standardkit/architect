import { Type } from '@nestjs/common';
import { Method, Relation } from '../constants';
import { DataRelations, MethodType, ScopeType } from '../types';
import { defineRelateById } from './define-relate-by-id';
import { defineRelateByIds } from './define-relate-by-ids.function';
import { getDataRelations } from './get-data-relations';
import { getScopedFields } from './get-scoped-fields';
import { trueOrMethod } from './method-option.helpers';
import { entries } from '@standardkit/core';

export function defineRequestRelations<Entity>(
  request: Type,
  entity: Type<Entity>,
  method: Omit<MethodType, typeof Method.Delete>,
  scope: ScopeType<Entity>[],
): void {
  const properties: DataRelations<Entity> = getDataRelations(entity);

  entries(properties).forEach(([field, options]) => {
    if (!trueOrMethod(method as MethodType, options.canRelateById)) return;

    const scopedFields = getScopedFields(scope);
    if (scopedFields.includes(field)) return;

    switch (options.relation) {
      case Relation.ManyToMany:
        return defineRelateByIds(request, field, options);
      case Relation.ManyToOne:
        return defineRelateById<Entity, typeof field>(request, field, options, method as MethodType);
    }
  });
}
