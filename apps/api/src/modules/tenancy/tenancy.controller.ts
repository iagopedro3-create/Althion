import {
  createMembershipSchema,
  membershipIdParamsSchema,
  organizationIdParamsSchema,
  type CreateMembershipInput,
} from '@althion/contracts';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { z } from 'zod';

import { CurrentAccessToken } from '../../common/auth/current-access-token.decorator';
import { RequireCapability } from '../../common/auth/require-capability.decorator';
import { CurrentRequestId } from '../../common/http/current-request-id.decorator';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { TenancyService } from './tenancy.service';

const idempotencyKeySchema = z.string().trim().min(16).max(200);

@Controller('api/v1/organizations/:organizationId')
export class TenancyController {
  public constructor(private readonly tenancy: TenancyService) {}

  @Get()
  @RequireCapability('organization:read')
  public getOrganization(
    @CurrentAccessToken() accessToken: string,
    @Param(new ZodValidationPipe(organizationIdParamsSchema))
    params: z.infer<typeof organizationIdParamsSchema>,
  ) {
    return this.tenancy.getOrganization(accessToken, params.organizationId);
  }

  @Get('clinics')
  @RequireCapability('clinic:read')
  public listClinics(
    @CurrentAccessToken() accessToken: string,
    @Param(new ZodValidationPipe(organizationIdParamsSchema))
    params: z.infer<typeof organizationIdParamsSchema>,
  ) {
    return this.tenancy.listClinics(accessToken, params.organizationId);
  }

  @Get('memberships')
  @RequireCapability('membership:read')
  public listMemberships(
    @CurrentAccessToken() accessToken: string,
    @Param(new ZodValidationPipe(organizationIdParamsSchema))
    params: z.infer<typeof organizationIdParamsSchema>,
  ) {
    return this.tenancy.listMemberships(accessToken, params.organizationId);
  }

  @Post('memberships')
  @RequireCapability('membership:manage')
  public async grantMembership(
    @CurrentAccessToken() accessToken: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(organizationIdParamsSchema))
    params: z.infer<typeof organizationIdParamsSchema>,
    @Body(new ZodValidationPipe(createMembershipSchema)) input: CreateMembershipInput,
  ): Promise<{ id: string }> {
    const key = this.parseIdempotencyKey(idempotencyKey);
    const id = await this.tenancy.grantMembership(
      accessToken,
      params.organizationId,
      input,
      key,
      requestId,
    );
    return { id };
  }

  @Patch('memberships/:membershipId/revoke')
  @RequireCapability('membership:manage')
  public async revokeMembership(
    @CurrentAccessToken() accessToken: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(membershipIdParamsSchema))
    params: z.infer<typeof membershipIdParamsSchema>,
  ): Promise<{ status: 'revoked' }> {
    await this.tenancy.revokeMembership(
      accessToken,
      params.organizationId,
      params.membershipId,
      this.parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { status: 'revoked' };
  }

  @Get('feature-flags')
  @RequireCapability('feature_flag:read')
  public listFeatureFlags(
    @CurrentAccessToken() accessToken: string,
    @Param(new ZodValidationPipe(organizationIdParamsSchema))
    params: z.infer<typeof organizationIdParamsSchema>,
  ) {
    return this.tenancy.listEffectiveFeatureFlags(accessToken, params.organizationId);
  }

  @Get('audit-logs')
  @RequireCapability('audit_log:read')
  public listAuditLogs(
    @CurrentAccessToken() accessToken: string,
    @Param(new ZodValidationPipe(organizationIdParamsSchema))
    params: z.infer<typeof organizationIdParamsSchema>,
  ) {
    return this.tenancy.listAuditLogs(accessToken, params.organizationId);
  }

  @Get('integrations')
  @RequireCapability('integration:read')
  public listIntegrations(
    @CurrentAccessToken() accessToken: string,
    @Param(new ZodValidationPipe(organizationIdParamsSchema))
    params: z.infer<typeof organizationIdParamsSchema>,
  ) {
    return this.tenancy.listIntegrations(accessToken, params.organizationId);
  }

  private parseIdempotencyKey(value: string | undefined): string {
    const result = idempotencyKeySchema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Informe uma chave de idempotência válida.',
      });
    }
    return result.data;
  }
}
