import { RawFilters } from '@standardkit/nest-architect';

export type FilteredRequestType<Entity> = {
  filter?: RawFilters<Entity>;
};
