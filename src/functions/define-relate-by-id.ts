import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Method } from '../constants';
import { DataRelationOptions } from '../interfaces';
import { MethodType } from '../types';
import { trueOrMethod } from './method-option.helpers';
import { KeyOf } from '@standardkit/core';

export function defineRelateById<Entity, Key extends KeyOf<Entity>>(
  request: Type,
  field: Key,
  options: DataRelationOptions,
  method: MethodType,
): void {
  const key = `${field}Id`;
  const isRequired = (!options.nullable && method === Method.Create) || trueOrMethod(method, options.required);

  Object.defineProperty(request.prototype, key, { writable: true, enumerable: true });

  ApiProperty({
    type: String,
    description: `ID of existing ${field} to relate`,
    example: 'abc123',
    required: isRequired,
  })(request.prototype, key);
  if (!isRequired) {
    IsOptional()(request.prototype, key);
  }
  IsString()(request.prototype, key);
}
