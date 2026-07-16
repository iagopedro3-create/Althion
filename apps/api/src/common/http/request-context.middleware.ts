import { randomUUID } from 'node:crypto';

import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';

import type { AuthenticatedRequest } from './authenticated-request';

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  public use(request: AuthenticatedRequest, response: Response, next: NextFunction): void {
    const receivedRequestId = request.header('x-request-id');
    request.requestId =
      receivedRequestId && REQUEST_ID_PATTERN.test(receivedRequestId)
        ? receivedRequestId
        : randomUUID();

    response.setHeader('x-request-id', request.requestId);
    next();
  }
}
