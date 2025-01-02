import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type as TypeDecorator } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { DataRelationOptions } from '../interfaces';
import { getRelationField } from './get-relation-field';

export function defineRelateByIds(request: Type, field: string, options: DataRelationOptions): void {
  const name = getRelationField(field, options);
  const key = `${name}Ids`;

  Object.defineProperty(request.prototype, key, { writable: true, enumerable: true });

  ApiProperty({
    type: [String],
    description: `IDs of existing ${name} to relate`,
    example: ['abc123', 'def456'],
    required: !!options.required,
  })(request.prototype, key);
  IsArray()(request.prototype, key);
  if (!options.required) {
    IsOptional()(request.prototype, key);
  }
  IsString({ each: true })(request.prototype, key);
  TypeDecorator(() => String)(request.prototype, key);
}
