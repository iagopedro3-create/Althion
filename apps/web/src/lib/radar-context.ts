import { z } from 'zod';

const radarContextSchema = z.object({
  clinicId: z.uuid(),
  organizationId: z.uuid(),
});

export interface RadarContext {
  readonly clinicId: string;
  readonly organizationId: string;
}

export function parseRadarContext(value: unknown): RadarContext | null {
  const parsed = radarContextSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function radarQuery(context: RadarContext): string {
  return new URLSearchParams({
    clinicId: context.clinicId,
    organizationId: context.organizationId,
  }).toString();
}
