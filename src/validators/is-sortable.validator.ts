import { Type } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { getSortableFields } from '../functions';
import { KeyOf } from '@standardkit/core';

@ValidatorConstraint({ name: 'isSortable', async: false })
export class IsSortableValidator<Entity> implements ValidatorConstraintInterface {
  public validate(value: any, args: ValidationArguments): boolean {
    const entity: Type<Entity> = (args.object as any).entity;
    const sortableFields = getSortableFields(entity);

    return Object.keys(value).every((key) => sortableFields.includes(key as KeyOf<Entity>));
  }

  public defaultMessage(): string {
    return 'Invalid sort fields provided';
  }
}
