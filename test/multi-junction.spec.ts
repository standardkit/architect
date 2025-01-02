import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Type } from '@nestjs/common';
import { createChildController, NestMetadata, SwaggerMetadataKey } from '@standardkit/nest-architect';

@Entity()
class User {
  @PrimaryKey()
  public id: number;

  @Property()
  public name: string;

  @OneToMany(() => Membership, (membership: Membership): User => membership.user)
  public memberships = new Collection<Membership>(this);
}

@Entity()
class Organization {
  @PrimaryKey()
  public id: number;

  @Property()
  public name: string;

  @OneToMany(() => Membership, (membership: Membership): Organization => membership.organization)
  public memberships = new Collection<Membership>(this);
}

@Entity()
class Membership {
  @ManyToOne(() => User)
  public user: User;

  @ManyToOne(() => Organization)
  public organization: Organization;

  @Property()
  public role: string;
}

describe('Multi Junction Relationship', (): void => {
  let controller;

  beforeAll(() => {
    controller = createChildController(Organization, User, { through: Membership, multi: true, include: ['role'] });
  });

  it('should have a proper controller path', (): void => {
    const path = Reflect.getMetadata(NestMetadata.Path, controller);

    expect(path).toBe('organizations/:organizationId/users');
  });

  describe('Get Endpoint', (): void => {
    let get;
    const statusCode = '200';

    beforeAll(() => {
      get = controller.prototype['get'];
    });

    it('should have a get endpoint', (): void => {
      expect(get).toBeDefined();
    });

    it('should set the right response code', () => {
      const paramTypes = Reflect.getMetadata(SwaggerMetadataKey.ApiResponse, get);

      expect(Object.getOwnPropertyNames(paramTypes)).toEqual([statusCode]);
    });

    it('should have the right path for get endpoint', (): void => {
      const path = Reflect.getMetadata(NestMetadata.Path, get);

      expect(path).toBe('/');
    });

    it('should set the right swagger response type', () => {
      const paramTypes = Reflect.getMetadata(SwaggerMetadataKey.ApiResponse, get);
      const options = paramTypes[statusCode] as any;
      expect(options.type.name).toBe('OrganizationUserDataResponse');
    });

    it('should have data in the response', () => {
      const paramTypes = Reflect.getMetadata(SwaggerMetadataKey.ApiResponse, get);
      const response: Type = (paramTypes[statusCode] as any).type;

      const metadata = Reflect.getMetadata(SwaggerMetadataKey.Model, response.prototype, 'data');
      expect(metadata).toBeDefined();

      // TODO : Implement tests for asserting the response data type to be named ...Data and include roles array
      // { data: [
      //  { id: 'userid', name: 'Pietje', roles: [ 'name' , 'editor'] }
      // ]}

      // expect(metadata.type()).toEqual( ' data type ');
    });
  });
});
