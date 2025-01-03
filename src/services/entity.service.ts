import { EntityManager, ExpandQuery, FilterQuery, FindOptions, Reference } from '@mikro-orm/core';
import { Injectable, Type } from '@nestjs/common';
import { entries, FilterOperator, FilterOperatorType, KeyOf, List } from '@standardkit/core';
import { Method, OrmOperator, Relation } from '../constants';
import { DataRequest, FilterOption, PaginationMeta } from '../dtos';
import { getDataRelations, getPopulatedFields, trueOrMethod } from '../functions';
import { getRelationField } from '../functions/get-relation-field';
import { getScopedFields } from '../functions/get-scoped-fields';
import { DataRelationOptions, DataResponse } from '../interfaces';
import { DataRelations, IdType, MethodType, OrmOperatorType, ScopeType } from '../types';
import { RelationService } from './relation.service';

@Injectable()
export class EntityService {
  constructor(
    private readonly entityManager: EntityManager,
    private relationService: RelationService,
  ) {}

  public async get<Entity>(
    entity: Type<Entity>,
    request: DataRequest<Entity>,
    scope: ScopeType<Entity>[] = [],
  ): Promise<DataResponse<Entity>> {
    const filterQuery: FilterQuery<Entity> = this.buildFilterQuery(request.filter);
    const restrictFilterQuery = this.getScopeFilters(entity, scope);

    const findOptions: FindOptions<Entity> = {
      limit: request.limit,
      offset: request.offset,
      orderBy: request.sort,
      populate: getPopulatedFields(entity, Method.GetMany) as never[], // Hack to assert the type for MikroORM
    };

    const [data, total] = await this.entityManager.findAndCount(
      entity,
      { ...filterQuery, ...restrictFilterQuery },
      findOptions,
    );
    const serializedData = await Promise.all(
      data.map(async (entityInstance): Promise<Entity> => await this.serialize(entity, entityInstance, Method.GetMany)),
    );

    return {
      data: serializedData,
      metadata: {
        pagination: this.createPaginationMeta(request.offset, request.limit, data.length, total),
        sort: entries(request.sort).map(([field, order]) => ({ field, order })),
        filters: request.filter ?? [],
      },
    };
  }

  public async create<Entity extends object>(
    entityClass: Type<Entity>,
    request: Partial<Entity>,
    scope: ScopeType<Entity>[] = [],
  ): Promise<Partial<Entity>> {
    // TODO : Not quite sure this works as intended
    const relations = getScopedFields(scope).map((field: KeyOf<Entity>): [KeyOf<Entity>, IdType] => [
      field,
      this.relationService.getScopedRelationId(field, true),
    ]);

    const references: Partial<Record<KeyOf<Entity>, Reference<object>>> = this.getRelationReferences(
      entityClass,
      { ...request, ...relations },
      Method.Create,
    );
    // Create entity
    const entity = this.entityManager.create(entityClass, request as Entity);

    // Assign relations
    Object.assign(entity, references);

    // Saving
    await this.entityManager.persistAndFlush(entity);

    // Output
    return this.serialize(entityClass, entity, Method.Create);
  }

  public async getOne<Entity>(
    entityClass: Type<Entity>,
    id: string,
    scope: ScopeType<Entity>[] = [],
    skipHydration: boolean = false,
  ): Promise<Entity> {
    const query = { id, ...this.getScopeFilters(entityClass, scope) };

    if (skipHydration) {
      return this.entityManager.findOneOrFail(entityClass, query);
    }

    const populatedFields = getPopulatedFields(entityClass, Method.GetOne);

    const entity = await this.entityManager.findOneOrFail(entityClass, query, {
      populate: populatedFields as never[], // Hack to assert the type for MikroORM
    });

    return this.serialize(entityClass, entity, Method.GetOne);
  }

  public async update<Entity extends object>(
    entityClass: Type<Entity>,
    id: string,
    request: Partial<Entity>,
    scope: ScopeType<Entity>[] = [],
  ): Promise<Entity> {
    const references: List<KeyOf<Entity>, Reference<Entity>> = this.getRelationReferences(
      entityClass,
      request,
      Method.Update,
    );

    const query = { id, ...this.getScopeFilters(entityClass, scope) };
    const entity = await this.entityManager.findOneOrFail(entityClass, query);

    Object.assign(entity, references);
    this.entityManager.assign<Entity>(entity, request);

    await this.entityManager.persistAndFlush(entity);

    return this.serialize(entityClass, entity, Method.Create);
  }

  // TODO : Move to controller?
  public serialize<T>(_entityClass: Type<T>, entity: T, _method: MethodType): any {
    // TODO : Implement
    return { ...entity };
  }

  public async delete<Entity>(entityClass: Type<Entity>, id: string, scope: ScopeType<Entity>[] = []): Promise<void> {
    const query = { id, ...this.getScopeFilters(entityClass, scope) };
    const entity = await this.entityManager.findOneOrFail(entityClass, query);

    return this.entityManager.removeAndFlush(entity);
  }

  private buildFilterQuery<T>(filters?: FilterOption<T>[]): FilterQuery<T> {
    const query: FilterQuery<T> = {};

    filters?.forEach((filter) => {
      if (filter.operator === FilterOperator.All) {
        query.$and = (filter.value as string[]).map(
          (value) => ({ [filter.field]: { $in: [value] } }) as ExpandQuery<T>,
        );
      } else {
        const ormOperator = this.getOperator(filter.operator);
        query[filter.field as string] = { ...query[filter.field as string], [ormOperator]: filter.value };
      }
    });

    return query;
  }

  private getOperator(operator: FilterOperatorType): OrmOperatorType {
    switch (operator) {
      case FilterOperator.All:
        return OrmOperator.All;
      case FilterOperator.Equals:
        return OrmOperator.Equals;
      case FilterOperator.NotEquals:
        return OrmOperator.NotEquals;
      case FilterOperator.In:
        return OrmOperator.In;
      case FilterOperator.NotIn:
        return OrmOperator.NotIn;
      case FilterOperator.GreaterThan:
        return OrmOperator.GreaterThan;
      case FilterOperator.GreaterThanOrEquals:
        return OrmOperator.GreaterThanOrEquals;
      case FilterOperator.LessThan:
        return OrmOperator.LessThan;
      case FilterOperator.LessThanOrEquals:
        return OrmOperator.LessThanOrEquals;
    }
  }

  private createPaginationMeta(
    offset: number,
    limit: number,
    currentItems: number,
    totalItems: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = offset / limit + 1;

    return { offset, limit, currentItems, totalItems, currentPage, totalPages };
  }

  private getRelationReferences<Entity extends object, Key extends KeyOf<Entity>>(
    entity: Type<Entity>,
    request: object,
    method: MethodType,
  ): Partial<Record<Key, Reference<Entity>>> {
    const references: Partial<Record<Key, Reference<Entity>>> = {};

    const relationProperties: DataRelations<Entity> = getDataRelations(entity);

    entries(relationProperties).forEach(([field, options]) => {
      if (!trueOrMethod(method, options.canRelateById)) return;

      switch (options.relation) {
        case Relation.ManyToMany:
          references[field as string] = this.createRelateByIdsReference(request, field, options);
          break;
        case Relation.ManyToOne:
          references[field as string] = this.createRelateByIdReference(request, field, options);
          break;
      }
    });

    return references;
  }

  private createRelateByIdReference<Entity>(request: object, field: string, options: DataRelationOptions): Entity {
    const key = `${field}Id`;

    if (Object.prototype.hasOwnProperty.call(request, key)) {
      return this.entityManager.getReference(options.type, { id: request[key] });
    }
  }

  private createRelateByIdsReference(
    request: object,
    field: string,
    options: DataRelationOptions,
  ): Reference<any>[] | undefined {
    const name = getRelationField(field, options);
    const key = `${name}Ids`;

    if (Object.prototype.hasOwnProperty.call(request, key)) {
      return request[key].map((id: string) => this.entityManager.getReference(options.type, id));
    }
  }

  private getScopeFilters<Entity>(entity: Type<Entity>, scope: ScopeType<Entity>[]): FilterQuery<Entity> {
    const dataRelations: DataRelations<Entity> = getDataRelations<Entity>(entity);
    const scopedFields: KeyOf<Entity>[] = getScopedFields(scope);

    const query: FilterQuery<Entity> = {};
    entries(dataRelations).forEach(([field, _options]) => {
      if (!scopedFields.includes(field)) return;

      const relationId = this.relationService.getScopedRelationId(field, true);

      query[field as string] = { [OrmOperator.Equals]: relationId };
    });

    return query;
  }
}
