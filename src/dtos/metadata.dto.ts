import { ApiProperty } from '@nestjs/swagger';
import { FilterOption } from './filter.option';
import { PaginationMeta } from './pagination.meta';
import { SortOption } from './sort.option';

export class Metadata<T> {
  @ApiProperty({
    type: PaginationMeta,
    required: true,
    example: {
      offset: 0,
      limit: 10,
      currentPage: 1,
      totalPages: 123,
      currentItems: 10,
      totalItems: 1230,
    },
  })
  public pagination: PaginationMeta;

  @ApiProperty({
    type: [SortOption],
    required: false,
    description: 'Describes the current sorting of the response',
  })
  public sort?: SortOption<T>[];

  @ApiProperty({
    type: [FilterOption],
    required: false,
    description: 'Describe the filters currently applied',
  })
  public filters?: Omit<FilterOption<T>, 'type'>[];
}
