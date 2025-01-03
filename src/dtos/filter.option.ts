import { ApiProperty } from '@nestjs/swagger';
import { FilterOperator, FilterOperatorType } from '@standardkit/core';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FilterValueType } from '../types';

export class FilterOption<T> {
  @ApiProperty({
    required: true,
    description: 'Key of the property where the filters are applied to',
    example: 'status',
  })
  @IsNotEmpty()
  public field!: keyof T;

  @ApiProperty({
    required: true,
    description: `Filter Operator: '${Object.values(FilterOperator).join("', '")}'`,
    example: FilterOperator.In,
  })
  @IsEnum(FilterOperator)
  public operator: FilterOperatorType;

  @ApiProperty({
    required: true,
    description: 'Value(s) of the field you wish to filter',
    example: ['new', 'open'],
  })
  public value!: FilterValueType;
}
