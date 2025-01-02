import { Injectable } from '@nestjs/common';
import { IdType, ScopedRelations } from '@standardkit/nest-architect';

@Injectable()
export class RelationService {
  private scopedRelations: ScopedRelations = {};

  public setRelations(scopedRelations: ScopedRelations): void {
    this.scopedRelations = scopedRelations;
  }

  public getScopedRelationId(name: string, throwException: boolean = false): IdType {
    const relation = this.scopedRelations[name];
    if (!relation && throwException) {
      throw new Error(`Relation for field: '${name}' not found`);
    }
    return relation;
  }

  public addRelation(key: string, value: IdType): void {
    this.scopedRelations[key] = value;
  }
}
