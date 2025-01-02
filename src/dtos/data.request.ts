import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, Min, Validate } from 'class-validator';
import { IsSortable } from '../decorators';
import { IsMultipleOfLimitValidator } from '../validators';
import { FilterOption } from './filter.option';
import { SortOrderType } from '@standardkit/core';

export class DataRequest<Entity> {
  constructor(entity: new () => Entity) {
    this.entity = entity;
  }

  @IsObject()
  public entity: new () => Entity;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @Validate(IsMultipleOfLimitValidator)
  public offset: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({ required: false, default: 10 })
  public limit: number = 10;

  @ApiProperty({ required: false, type: Object, description: 'Sorting options' })
  @IsObject()
  @IsOptional()
  @IsSortable()
  public sort?: Partial<Record<keyof Entity, SortOrderType>>;

  @IsOptional()
  public filter?: FilterOption<Entity>[];
}
