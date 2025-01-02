import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SortOrder, SortOrderType } from '@standardkit/core';

export class SortOption<T> {
  @ApiProperty({ description: 'Key of the field you wish to sort by', example: 'status' })
  public field!: keyof T;

  @ApiProperty({
    required: true,
    enum: SortOrder,
    description: 'Sort direction',
  })
  @IsEnum(SortOrder)
  public order!: SortOrderType;
}