import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty()
  public offset: number;

  @ApiProperty()
  public limit: number;

  @ApiProperty()
  public currentPage: number;

  @ApiProperty()
  public totalPages: number;

  @ApiProperty()
  public currentItems: number;

  @ApiProperty()
  public totalItems: number;
}
