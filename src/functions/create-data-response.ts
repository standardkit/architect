import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { createEntityResponse, Metadata, Method } from '@standardkit/nest-architect';
import { DataResponse } from '../interfaces';

export function createDataResponse<T>(entity: Type<T>, entityName: string): Type<DataResponse<T>> {
  class DataResponseClass {
    @ApiProperty({ isArray: true, type: () => createEntityResponse(entity, Method.GetMany, entityName) })
    public data: T[];

    @ApiProperty({ description: 'Metadata of the request (currently applied data-filters)' })
    public metadata: Metadata<T>;
  }

  return DataResponseClass as Type<DataResponse<T>>;
}
