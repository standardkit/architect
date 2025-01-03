import { Entity, Property } from '@mikro-orm/core';
import { Type } from '@nestjs/common';
import {
  createController,
  MetadataKey,
  NestMetadata,
  NestMethod,
  SwaggerMetadataKey,
} from '@standardkit/nest-architect';

@Entity()
class Article {
  @Property()
  public title: string;
}

describe('Basic Entity', (): void => {
  let controller: Type;

  beforeAll((): void => {
    controller = createController(Article);
  });

  it('should have a proper controller name', (): void => {
    expect(controller.name).toBe('ArticleController');
  });

  it('should have a proper controller path', (): void => {
    const path = Reflect.getMetadata(NestMetadata.Path, controller);

    expect(path).toBe('/articles');
  });

  it.each(['constructor', 'get', 'getOne', 'create', 'update', 'delete'])(
    'Should have the %s method',
    (method: string): void => {
      expect(controller.prototype[method]).toBeDefined();
    },
  );

  it('should have exactly 6 methods', (): void => {
    expect(Object.getOwnPropertyNames(controller.prototype).length).toEqual(6);
  });

  describe('GetOne Method', () => {
    let getOne;

    beforeAll(() => {
      getOne = controller.prototype['getOne'];
    });

    it('should have the right request method for getOne', (): void => {
      const method = Reflect.getMetadata(NestMetadata.Method, getOne);

      expect(method).toBe(NestMethod.Get);
    });

    it('should have the right path for getOne', (): void => {
      const path = Reflect.getMetadata(NestMetadata.Path, getOne);

      expect(path).toBe(':id');
    });
  });

  describe('Create Method', () => {
    let create;

    beforeAll(() => {
      create = controller.prototype['create'];
    });

    it('should have the right request method for create', (): void => {
      const method = Reflect.getMetadata(NestMetadata.Method, create);

      expect(method).toBe(NestMethod.Post);
    });

    it('should have the right path for create', (): void => {
      const path = Reflect.getMetadata(NestMetadata.Path, create);

      expect(path).toBe('/');
    });

    it('should have only 1 request parameter', () => {
      const paramTypes = Reflect.getMetadata(MetadataKey.ParameterTypes, controller.prototype, 'create');
      expect(paramTypes.length).toBe(1);
    });

    it('should set the right request name', () => {
      const paramTypes = Reflect.getMetadata(MetadataKey.ParameterTypes, controller.prototype, 'create');
      const requestType: Type = paramTypes[0];
      expect(requestType.name).toBe('CreateArticleRequest');
    });

    it('should set the right request body', () => {
      const paramTypes = Reflect.getMetadata(MetadataKey.ParameterTypes, controller.prototype, 'create');
      const requestType: Type = paramTypes[0];
      const type = Reflect.getMetadata(SwaggerMetadataKey.Array, requestType.prototype);

      expect(type).toEqual([':title']);
    });

    it('should set the right response code', () => {
      const paramTypes = Reflect.getMetadata(SwaggerMetadataKey.ApiResponse, create);

      expect(Object.getOwnPropertyNames(paramTypes)).toEqual(['201']);
    });

    it('should set the right swagger response description', () => {
      const paramTypes = Reflect.getMetadata(SwaggerMetadataKey.ApiResponse, create);
      const options = paramTypes['201'] as any;
      expect(options.description).toEqual('Returns the created article');
    });

    it('should set the right swagger response type', () => {
      const paramTypes = Reflect.getMetadata(SwaggerMetadataKey.ApiResponse, create);
      const options = paramTypes['201'] as any;
      expect(options.type.name).toBe('CreateArticleResponse');
    });

    it('should have title in the response', () => {
      const paramTypes = Reflect.getMetadata(SwaggerMetadataKey.ApiResponse, create);
      const response: Type = (paramTypes['201'] as any).type;

      const metadata = Reflect.getMetadata(SwaggerMetadataKey.Model, response.prototype, 'title');
      expect(metadata).toBeDefined();
      expect(metadata.example).toEqual('abc123');
      expect(metadata.type()).toEqual(String);
    });
  });
});
