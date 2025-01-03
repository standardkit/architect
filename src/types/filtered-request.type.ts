import { RawFilters } from '@standardkit/nest-architect';

export interface FilteredRequestType<Entity> {
  filter?: RawFilters<Entity>;
}
