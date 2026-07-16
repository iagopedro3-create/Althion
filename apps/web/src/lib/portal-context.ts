import { z } from 'zod';

const portalContextSchema = z.object({
  clinicId: z.uuid(),
  organizationId: z.uuid(),
});

export interface PortalContext {
  readonly clinicId: string;
  readonly organizationId: string;
}

export function parsePortalContext(value: unknown): PortalContext | null {
  const result = portalContextSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function portalQuery(context: PortalContext): string {
  return new URLSearchParams({
    clinicId: context.clinicId,
    organizationId: context.organizationId,
  }).toString();
}
