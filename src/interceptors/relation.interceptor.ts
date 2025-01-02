import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { RelationService } from '../services';
import { LOAD_RELATIONS_TOKEN } from '../tokens';
import { ScopedRelations } from '@standardkit/nest-architect';

@Injectable()
export class RelationInterceptor implements NestInterceptor {
  constructor(
    @Inject(LOAD_RELATIONS_TOKEN)
    private loadRelations: (context: ExecutionContext) => Promise<ScopedRelations> | ScopedRelations,
    private relationService: RelationService,
  ) {}

  public async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    if (!this.loadRelations) return;

    const relations = await this.loadRelations(context);

    this.relationService.setRelations(relations);

    return next.handle();
  }
}
