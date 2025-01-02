import {
  applyDecorators,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Type,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { camel, depascalize, human, kebab, pascal, path, title } from '@standardkit/caas';
import { Method } from '../constants';
import { ApiFilter, ApiSort } from '../decorators';
import { DataRequest } from '../dtos';
import { ChildControllerOptions, DataResponse } from '../interfaces';
import { EntityService, RelationService } from '../services';
import { createDataResponse } from './create-data-response';
import { createEntityResponse } from './create-entity-response';
import { createPostRequest } from './create-post-request';
import { createUpdateRequest } from './create-update-request';

const ID = 'id';

export function createChildController<Entity extends object, Parent extends object>(
  parent: Type<Parent>,
  entity: Type<Entity>,
  options: ChildControllerOptions<Parent, Entity> = {},
): any {
  const nameSegments = depascalize(options.name ?? entity.name);
  const pluralSegments = depascalize(options.plural ?? `${options.name ?? entity.name}s`);
  const parentNameSegments = depascalize(options.parentName ?? parent.name);
  const parentPluralSegments = depascalize(options.parentPlural ?? `${options.parentName ?? parent.name}s`);

  const parentIdKey = camel([...parentNameSegments, 'id']);
  const controllerPath = path([kebab(parentPluralSegments), `:${parentIdKey}`, kebab(pluralSegments)]);

  options.scope = [...(options.scope ?? []), parent]; // TODO : Check the actual field name for the parent

  class EntityDataRequest extends DataRequest<Entity> {
    constructor() {
      super(entity);
    }
  }

  class EntityDataResponse extends createDataResponse<Entity>(
    entity,
    pascal([...parentNameSegments, ...nameSegments]),
  ) {}
  class CreateRequest extends createPostRequest<Entity>(entity, options.scope) {}
  class UpdateRequest extends createUpdateRequest<Entity>(entity, options.scope) {}

  Object.defineProperty(CreateRequest, 'name', {
    value: pascal(['create', ...parentNameSegments, ...nameSegments, 'request']),
  });
  Object.defineProperty(UpdateRequest, 'name', {
    value: pascal(['update', ...parentNameSegments, ...nameSegments, 'request']),
  });
  Object.defineProperty(EntityDataResponse, 'name', {
    value: pascal([...parentNameSegments, ...nameSegments, 'data', 'response']),
  });

  @ApiTags(title([...parentNameSegments, ...pluralSegments]))
  @Controller(controllerPath)
  class GenericController {
    constructor(
      public readonly entityService: EntityService,
      private relationService: RelationService,
    ) {}

    @Get()
    @ApiOperation({ summary: `Get list of ${human(pluralSegments)}` })
    @ApiOkResponse({ description: `Returns a list of ${human(pluralSegments)}`, type: EntityDataResponse })
    @ApiSort(entity)
    @ApiFilter(entity, options.scope)
    @ApiParam({ name: parentIdKey, type: 'string', description: `ID of the ${human(parentNameSegments)}` })
    public async get(
      @Param() parameters: { [parentIdKey: string]: string },
      @Query() request: EntityDataRequest,
    ): Promise<DataResponse<Entity>> {
      await this.checkParentAccess(parameters[parentIdKey]);

      return this.entityService.get(entity, request, options.scope);
    }

    @Post()
    @ApiOperation({ summary: `Create a ${human(nameSegments)}` })
    @ApiCreatedResponse({
      description: `Returns the created ${human(nameSegments)}`,
      type: createEntityResponse(entity, Method.Create, pascal([...parentNameSegments, ...nameSegments])),
    })
    @ApiParam({ name: parentIdKey, type: 'string', description: `ID of the ${human(parentNameSegments)}` })
    public async create(
      @Param() parameters: { [parentIdKey: string]: string },
      @Body() request: CreateRequest,
    ): Promise<Partial<Entity>> {
      await this.checkParentAccess(parameters[parentIdKey]);

      return this.entityService.create(entity, request as Partial<Entity>, options.scope);
    }

    @Get(`:${ID}`)
    @ApiOperation({ summary: `Get the ${human(nameSegments)} by id` })
    @ApiOkResponse({
      description: `Return ${human(nameSegments)}`,
      type: createEntityResponse(entity, Method.GetOne, pascal([...parentNameSegments, ...nameSegments])),
    })
    @ApiParam({ name: parentIdKey, type: 'string', description: `ID of the ${human(parentNameSegments)}` })
    @ApiParam({ name: ID, type: 'string', description: `ID of the ${human(nameSegments)}` })
    public async getOne(@Param() parameters: { [parentIdKey: string]: string; id: string }): Promise<Entity> {
      await this.checkParentAccess(parameters[parentIdKey]);

      return this.entityService.getOne(entity, parameters.id, options.scope);
    }

    @Patch(`:${ID}`)
    @ApiOperation({ summary: `Update the ${human(nameSegments)}` })
    @ApiOkResponse({
      description: `Returns the updated ${human(nameSegments)}`,
      type: createEntityResponse(entity, Method.Update, pascal([...parentNameSegments, ...nameSegments])),
    })
    @ApiParam({ name: parentIdKey, type: 'string', description: `ID of the ${human(parentNameSegments)}` })
    @ApiParam({ name: ID, type: 'string', description: `ID of the ${human(nameSegments)}` })
    public async update(
      @Param() parameters: { [parentIdKey: string]: string; id: string },
      @Body() request: UpdateRequest,
    ): Promise<Entity> {
      await this.checkParentAccess(parameters[parentIdKey]);

      return this.entityService.update(entity, parameters.id, request as Partial<Entity>, options.scope);
    }

    @Delete(`:${ID}`)
    @ApiOperation({ summary: `Delete the ${human(nameSegments)}` })
    @ApiNoContentResponse({ description: `${human(nameSegments)} successfully deleted` })
    @ApiParam({ name: parentIdKey, type: 'string', description: `ID of the ${human(parentNameSegments)}` })
    @ApiParam({ name: ID, type: 'string', description: `ID of the ${human(nameSegments)}` })
    public async delete(@Param() parameters: { [parentIdKey: string]: string; id: string }): Promise<void> {
      await this.checkParentAccess(parameters[parentIdKey]);

      return this.entityService.delete(entity, parameters.id, options.scope);
    }

    private async checkParentAccess(parentId: string): Promise<void> {
      await this.entityService
        .getOne(parent, parentId, options.parentScope, true)
        .catch(() => {
          throw new ForbiddenException('Access to parent entity not allowed');
        })
        .then(() => {
          // TODO : Get the inverse relation reference of the parent somehow
          this.relationService.addRelation(camel(parentNameSegments), parentId);
        });
    }
  }

  // Apply class decorators (e.g. class-specific guards)
  applyDecorators(...(options.decorators ?? []))(GenericController);

  // Apply method decorators (e.g. method-specific guards)
  for (const [method, decorators] of Object.entries(options.methodDecorators ?? {})) {
    applyDecorators(...decorators)(GenericController.prototype, method);
  }

  const excludedMethods = [
    ...(options.exclude ?? []),
    ...(options.readOnly ? [Method.Create, Method.Update, Method.Delete] : []),
  ];
  for (const method of excludedMethods) {
    delete GenericController.prototype[method];
  }

  Object.defineProperty(GenericController, 'name', {
    value: pascal([...parentNameSegments, ...pluralSegments, 'controller']),
  });

  return GenericController;
}
