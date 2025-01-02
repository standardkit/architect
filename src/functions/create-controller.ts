import { applyDecorators, Body, Controller, Delete, Get, Param, Patch, Post, Query, Type } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Method } from '../constants';
import { ApiFilter, ApiSort } from '../decorators';
import { DataRequest } from '../dtos';
import { ControllerOptions, DataResponse } from '../interfaces';
import { EntityService } from '../services';
import { createDataResponse } from './create-data-response';
import { createEntityResponse } from './create-entity-response';
import { createPostRequest } from './create-post-request';
import { createUpdateRequest } from './create-update-request';
import { depascalize, human, kebab, pascal, title } from '@standardkit/caas';

const ID = 'id';

export function createController<Entity extends object>(
  entity: Type<Entity>,
  options: ControllerOptions<Entity> = {},
): Type {
  const prefixSegments = depascalize(options.prefix ?? '');
  const nameSegments = depascalize(options.name ?? entity.name);
  const prefixedNameSegments = [...prefixSegments, ...nameSegments];
  const pluralSegments = depascalize(options.plural ?? `${entity.name}s`);
  const prefixedPluralSegments = [...prefixSegments, ...pluralSegments];

  class EntityDataRequest extends DataRequest<Entity> {
    constructor() {
      super(entity);
    }
  }

  // Define request and response dtos
  class EntityDataResponse extends createDataResponse<Entity>(entity, pascal(prefixedNameSegments)) {}
  class CreateRequest extends createPostRequest<Entity>(entity, options.scope) {}
  class CreateResponse extends createEntityResponse(entity, Method.Create, pascal(nameSegments)) {}
  class UpdateRequest extends createUpdateRequest<Entity>(entity, options.scope) {}

  // Rename to avoid collisions
  Object.defineProperty(CreateRequest, 'name', { value: pascal(['create', ...prefixedNameSegments, 'request']) });
  Object.defineProperty(UpdateRequest, 'name', { value: pascal(['update', ...prefixedNameSegments, 'request']) });
  Object.defineProperty(EntityDataResponse, 'name', { value: pascal([...prefixedNameSegments, 'data', 'response']) });
  Object.defineProperty(CreateResponse, 'name', { value: pascal(['create', ...prefixedNameSegments, 'response']) });

  @ApiTags(title(prefixedPluralSegments))
  @Controller([kebab(prefixSegments), kebab(pluralSegments)].join('/'))
  class GenericController {
    constructor(public readonly entityService: EntityService) {}

    @Get()
    @ApiOperation({ summary: `Get list of ${human(pluralSegments)}` })
    @ApiOkResponse({ description: `Returns a list of ${human(pluralSegments)}`, type: EntityDataResponse })
    @ApiSort(entity)
    @ApiFilter(entity, options.scope)
    public get(@Query() request: EntityDataRequest): Promise<DataResponse<Entity>> {
      return this.entityService.get(entity, request, options.scope);
    }

    @Post()
    @ApiOperation({ summary: `Create a ${human(nameSegments)}` })
    @ApiCreatedResponse({ description: `Returns the created ${human(nameSegments)}`, type: CreateResponse })
    public create(@Body() request: CreateRequest): Promise<CreateResponse> {
      // TODO : Handle the as any, shouldn't be needed but entity service should be usable without createController
      return this.entityService.create(entity, request as Partial<Entity>, options.scope);
    }

    @Get(`:${ID}`)
    @ApiOperation({ summary: `Get the ${human(nameSegments)} by id` })
    @ApiOkResponse({
      description: `Returns the ${human(nameSegments)}`,
      type: createEntityResponse(entity, Method.GetOne, pascal(nameSegments)),
    })
    public getOne(@Param(ID) id: string): Promise<Entity> {
      return this.entityService.getOne(entity, id, options.scope);
    }

    @Patch(`:${ID}`)
    @ApiOperation({ summary: `Update the ${human(nameSegments)}` })
    @ApiOkResponse({
      description: `Returns the updated ${human(nameSegments)}`,
      type: createEntityResponse(entity, Method.Update, pascal(nameSegments)),
    })
    public update(@Param(ID) id: string, @Body() request: UpdateRequest): Promise<Entity> {
      return this.entityService.update(entity, id, request as Partial<Entity>, options.scope);
    }

    @Delete(`:${ID}`)
    @ApiOperation({ summary: `Delete the ${human(nameSegments)}` })
    @ApiNoContentResponse({ description: `${human(nameSegments)} successfully deleted` })
    public delete(@Param(ID) id: string): Promise<void> {
      return this.entityService.delete(entity, id, options.scope);
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

  Object.defineProperty(GenericController, 'name', { value: pascal([...prefixedNameSegments, 'controller']) });

  return GenericController;
}
