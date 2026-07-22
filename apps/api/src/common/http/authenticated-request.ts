import type { Principal } from '@althion/domain';
import type { Request } from 'express';

import type { AssuranceLevel } from '../../modules/auth/access-token-claims';

export interface AuthenticatedRequest extends Request {
  accessToken?: string;
  assuranceLevel?: AssuranceLevel;
  principal?: Principal;
  requestId: string;
}
