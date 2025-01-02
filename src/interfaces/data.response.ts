import { Metadata } from '@standardkit/nest-architect';

export interface DataResponse<T> {
  data: T[];
  metadata: Metadata<T>;
}
