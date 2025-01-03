import { EntityMetadata, MetadataStorage, ReferenceKind } from '@mikro-orm/core';
import { Type } from '@nestjs/common';
import { entries, KeyOf } from '@standardkit/core';
import { Method, Relation } from '../constants';
import { getRelationMetadata } from '../decorators';
import { RelationOptions } from '../interfaces';
import { DataRelations, RelationType } from '../types';

const RELATION_KINDS: ReferenceKind[] = [
  ReferenceKind.ONE_TO_ONE,
  ReferenceKind.ONE_TO_MANY,
  ReferenceKind.MANY_TO_ONE,
  ReferenceKind.MANY_TO_MANY,
];

function getKind(kind: ReferenceKind): RelationType {
  switch (kind) {
    case ReferenceKind.MANY_TO_MANY:
      return Relation.ManyToMany;
    case ReferenceKind.MANY_TO_ONE:
      return Relation.ManyToOne;
    case ReferenceKind.ONE_TO_MANY:
      return Relation.OneToMany;
    case ReferenceKind.ONE_TO_ONE:
      return Relation.OneToOne;
    default:
      throw new Error('Unsupported relation type');
  }
}

export function getDataRelations<Entity>(entity: Type<Entity>): DataRelations<Entity> {
  const entityMetadata: EntityMetadata<Entity> = Object.values(MetadataStorage.getMetadata()).find(
    (entityMetadata: EntityMetadata) => entityMetadata.name === entity.name,
  );
  const dataProperties: DataRelations<Entity> = {};

  // const entityMetadata: EntityMetadata = Object.values(MetadataStorage.getMetadata()).filter(
  //   (entityMetadata: EntityMetadata) => entityMetadata.name === entity.name,
  // )[0];
  // const properties = entityMetadata.properties[field];

  entries(entityMetadata.properties).forEach(([field, entityProperty]) => {
    if (!RELATION_KINDS.includes(entityProperty.kind)) return;

    const userOptions: RelationOptions = getRelationMetadata(entity, field);
    const relation = getKind(entityProperty.kind);

    const singleRelations: RelationType[] = [Relation.OneToOne, Relation.ManyToOne];

    dataProperties[field as unknown as KeyOf<Entity>] = {
      type: entityProperty.entity() as Type,
      relation,
      canRelateById: singleRelations.includes(relation),
      required: singleRelations.includes(relation) && !entityProperty.nullable ? Method.Create : false,
      expose: singleRelations.includes(relation),
      nullable: entityProperty.nullable,
      example: singleRelations.includes(relation) ? 'abc123' : undefined,
      filterable: singleRelations.includes(relation),
      populate: userOptions?.populate ?? false,

      ...userOptions,
    };
  });

  return dataProperties;
}
