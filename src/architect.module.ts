import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RelationInterceptor } from './interceptors';
import { ArchitectOptions } from './interfaces';
import { EntityService, RelationService } from './services';
import { LOAD_RELATIONS_TOKEN } from './tokens';

@Module({
  providers: [EntityService, RelationService],
  exports: [EntityService, RelationService],
})
export class ArchitectModule {
  public static forRoot(options: ArchitectOptions): DynamicModule {
    return {
      module: ArchitectModule,
      providers: [
        EntityService,
        RelationService,
        { provide: LOAD_RELATIONS_TOKEN, useValue: options.loadRelations },
        { provide: APP_INTERCEPTOR, useClass: RelationInterceptor },
      ],
      exports: [LOAD_RELATIONS_TOKEN, EntityService],
    };
  }
}
