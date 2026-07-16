import {
  type ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

import type { AuthenticatedRequest } from './authenticated-request';

interface ErrorBody {
  readonly error: {
    readonly code: string;
    readonly details?: unknown;
    readonly message: string;
    readonly requestId: string;
  };
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<AuthenticatedRequest>();
    const response = context.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
    const safe = this.toSafeError(status, exceptionResponse, request.requestId);

    response.status(status).json(safe);
  }

  private toSafeError(
    status: number,
    exceptionResponse: string | object | null,
    requestId: string,
  ): ErrorBody {
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const candidate = exceptionResponse as Record<string, unknown>;
      const code = typeof candidate.code === 'string' ? candidate.code : this.statusCode(status);
      const message =
        typeof candidate.message === 'string' ? candidate.message : this.statusMessage(status);
      const details = candidate.details;

      return {
        error: {
          code,
          ...(details === undefined ? {} : { details }),
          message,
          requestId,
        },
      };
    }

    return {
      error: {
        code: this.statusCode(status),
        message:
          typeof exceptionResponse === 'string' ? exceptionResponse : this.statusMessage(status),
        requestId,
      },
    };
  }

  private statusCode(status: number): string {
    return status === HttpStatus.INTERNAL_SERVER_ERROR ? 'INTERNAL_SERVER_ERROR' : `HTTP_${status}`;
  }

  private statusMessage(status: number): string {
    return status === HttpStatus.INTERNAL_SERVER_ERROR
      ? 'Não foi possível concluir a solicitação.'
      : 'Solicitação não concluída.';
  }
}
