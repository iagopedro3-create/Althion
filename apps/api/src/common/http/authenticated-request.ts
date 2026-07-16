import type { Principal } from '@althion/domain';
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  accessToken?: string;
  principal?: Principal;
  requestId: string;
}
