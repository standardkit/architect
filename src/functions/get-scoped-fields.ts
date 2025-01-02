import { camel, depascalize } from '@standardkit/caas';
import { KeyOf } from '@standardkit/core';
import { ScopeType } from '@standardkit/nest-architect';

function isKey<Entity>(scope: ScopeType<Entity>): scope is KeyOf<Entity> {
  return typeof scope === 'string';
}

export function getScopedFields<Entity>(scope: ScopeType<Entity>[]): KeyOf<Entity>[] {
  return scope.map((scope: ScopeType<Entity>): KeyOf<Entity> => {
    return isKey(scope) ? scope : (camel(depascalize(scope.name)) as KeyOf<Entity>);
  });
}
