import { Controller, Get } from '@nestjs/common';

import { Public } from '../../common/auth/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get('live')
  public live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Public()
  @Get('ready')
  public ready(): { checks: { api: 'ok' }; status: 'ok' } {
    return { checks: { api: 'ok' }, status: 'ok' };
  }
}
