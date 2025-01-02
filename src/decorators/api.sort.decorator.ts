import { applyDecorators, Type } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { getSortableFields } from '../functions';
import { SortOrder } from '@standardkit/core';

export function ApiSort<Entity>(entity: Type<Entity>): MethodDecorator {
  const sortableFields = getSortableFields(entity);

  if (sortableFields.length === 0) {
    return applyDecorators();
  }
  return applyDecorators(
    ApiQuery({
      name: `sort`,
      required: false,
      style: 'deepObject',
      explode: true,
      schema: {
        type: 'object',
        properties: Object.fromEntries(
          sortableFields.map((field, index) => [
            field,
            {
              example: index % 2 === 0 ? SortOrder.Ascending : SortOrder.Descending,
              enum: Object.values(SortOrder),
            },
          ]),
        ),
        additionalProperties: false,
      },
      description: `(Multi-)sort by fields: '${sortableFields.join("', '")}\'. Values: 'asc' or 'desc'`,
    }),
  );
}
