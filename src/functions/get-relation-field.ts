import { Relation } from '../constants';
import { DataRelationOptions } from '../interfaces';
import { RelationType } from '../types';
import { camel, depascalize } from '@standardkit/caas';

function isSingle(relation: RelationType): boolean {
  return ([Relation.ManyToOne, Relation.OneToOne] as RelationType[]).includes(relation);
}

export function getRelationField(field: string, options: DataRelationOptions): string {
  if (options.name) {
    return options.name;
  }
  if (isSingle(options.relation)) {
    return field;
  }
  if (field.endsWith('s')) {
    return field.slice(0, -1);
  }
  return camel(depascalize(options.type.name));
}
