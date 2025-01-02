import { ExecutionContext } from '@nestjs/common';
import { ScopedRelations } from '../types';

export interface ArchitectOptions {
  loadRelations: (context: ExecutionContext) => Promise<ScopedRelations> | ScopedRelations;
}
