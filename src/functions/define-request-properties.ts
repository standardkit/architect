import { Type } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Method } from '../constants';
import { MethodType } from '../types';
import { getDataProperties } from './get-data-properties';
import { trueOrMethod } from './method-option.helpers';
import { entries } from '@standardkit/core';

export function defineRequestProperties<Entity>(
  request: Type,
  entity: Type<Entity>,
  method: Omit<MethodType, typeof Method.Delete>,
): void {
  const properties = getDataProperties(entity);

  entries(properties).forEach(([field, options]) => {
    if (!trueOrMethod(method as MethodType, options.fillable)) return;

    const isOptional = !trueOrMethod(method as MethodType, options.required);

    // TODO : Fully implement
    // TODO : min/max validation
    // TODO : nullable? relationId: null to decouple it?
    ApiProperty({
      description: options.description,
      example: options.example,
      required: !isOptional,
      type: options.type,
    } as ApiPropertyOptions)(request.prototype, field);

    // Type specific
    switch (options.type) {
      case String:
        IsString()(request.prototype, field);
        break;
      case Number:
        IsNumber()(request.prototype, field);
        break;
      case Date:
        IsDate()(request.prototype, field);
    }

    if (!isOptional) {
      IsOptional()(request.prototype, field);
    }
  });
}
