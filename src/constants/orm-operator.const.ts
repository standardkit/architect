import { OperatorMap } from '@mikro-orm/core/typings';

export const OrmOperator = {
  All: '$contains',
  Equals: '$eq',
  NotEquals: '$ne',
  In: '$in',
  NotIn: '$nin',
  GreaterThan: '$gt',
  GreaterThanOrEquals: '$gte',
  LessThan: '$lt',
  LessThanOrEquals: '$lte',
} as const satisfies Record<string, keyof OperatorMap<any>>;
