import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';

export function translatePortalError(error: PostgrestError | null): Error {
  if (!error) return unavailable();
  if (error.code === '42501') {
    return new ForbiddenException({ code: 'ACCESS_DENIED', message: 'Acesso não autorizado.' });
  }
  if (error.code === 'P0002') {
    return new NotFoundException({
      code: 'PORTAL_RESOURCE_NOT_FOUND',
      message: 'Registro não encontrado.',
    });
  }
  if (['P0001', '23505', '23514', '55000', '55P03'].includes(error.code)) {
    return new ConflictException({
      code: 'PORTAL_STATE_CONFLICT',
      message: 'A operação conflita com o estado atual do registro.',
    });
  }
  if (['22023', '23503'].includes(error.code)) {
    return new BadRequestException({
      code: 'PORTAL_INPUT_INVALID',
      message: 'Os dados informados são inválidos para este contexto.',
    });
  }
  return unavailable();
}

export function unavailable(): ServiceUnavailableException {
  return new ServiceUnavailableException({
    code: 'DATA_SERVICE_UNAVAILABLE',
    message: 'Não foi possível consultar os dados agora.',
  });
}
