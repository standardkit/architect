import { registerDecorator } from 'class-validator';
import { IsSortableValidator } from '../validators';

export function IsSortable(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol): void => {
    if (typeof propertyKey === 'symbol') return;
    registerDecorator({
      name: 'isSortable',
      target: target.constructor,
      propertyName: propertyKey,
      validator: IsSortableValidator,
    });
  };
}
