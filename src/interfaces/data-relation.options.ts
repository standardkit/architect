import { Type } from '@nestjs/common';
import { RelationOptions, RelationType } from '@standardkit/nest-architect';

export interface DataRelationOptions extends RelationOptions {
  type: Type;
  relation: RelationType;
  nullable?: boolean;
  example?: string | object;
  description?: string;
}
