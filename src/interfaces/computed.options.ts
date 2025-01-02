import { Type } from '@nestjs/common';
import { MethodType } from '@standardkit/nest-architect';

export interface ComputedOptions {
  type?: Type;
  expose?: boolean | MethodType[];
  description?: string;
  example?: string;
}
