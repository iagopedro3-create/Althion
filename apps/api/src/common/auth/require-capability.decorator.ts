import type { Capability } from '@althion/domain';
import { SetMetadata } from '@nestjs/common';

export const REQUIRED_CAPABILITY_KEY = 'althion:required-capability';

export const RequireCapability = (capability: Capability): MethodDecorator & ClassDecorator =>
  SetMetadata(REQUIRED_CAPABILITY_KEY, capability);
