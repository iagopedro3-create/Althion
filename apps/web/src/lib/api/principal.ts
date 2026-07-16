import { principalResponseSchema, type PrincipalResponse } from '@althion/contracts';

export type PrincipalResult =
  | { readonly kind: 'success'; readonly principal: PrincipalResponse }
  | { readonly kind: 'denied' }
  | { readonly kind: 'unavailable' };

export async function fetchPrincipal(accessToken: string): Promise<PrincipalResult> {
  const apiUrl = process.env.ALTHION_API_URL;
  if (!apiUrl) return { kind: 'unavailable' };

  try {
    const response = await fetch(`${apiUrl}/api/v1/me`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.status === 401 || response.status === 403) return { kind: 'denied' };
    if (!response.ok) return { kind: 'unavailable' };

    const parsed = principalResponseSchema.safeParse(await response.json());
    return parsed.success ? { kind: 'success', principal: parsed.data } : { kind: 'unavailable' };
  } catch {
    return { kind: 'unavailable' };
  }
}
