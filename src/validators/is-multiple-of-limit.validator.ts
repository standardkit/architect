import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isMultipleOfLimit', async: false })
@Injectable()
export class IsMultipleOfLimitValidator implements ValidatorConstraintInterface {
  public validate(offset: number, args: ValidationArguments): boolean {
    const limit = (args.object as any).limit;

    return offset % limit === 0;
  }

  public defaultMessage(): string {
    return `Offset must be 0 or a multiple of the limit`;
  }
}
