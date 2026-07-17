import { describe, expect, it } from 'vitest';
import { saveGoogleAdsCredentialsSchema } from './marketing';

describe('google ads validation schemas', () => {
  it('validates correct google ads credentials input', () => {
    const valid = {
      refresh_token: '1/abc123xyz',
      developer_token: 'dev-token-999',
      customer_id: '123-456-7890',
    };
    const parsed = saveGoogleAdsCredentialsSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid customer id formats', () => {
    const invalid = {
      refresh_token: '1/abc123xyz',
      developer_token: 'dev-token-999',
      customer_id: 'invalid-customer-id',
    };
    const parsed = saveGoogleAdsCredentialsSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('rejects empty credentials fields', () => {
    const invalid = {
      refresh_token: '',
      developer_token: 'dev-token-999',
      customer_id: '123-456-7890',
    };
    const parsed = saveGoogleAdsCredentialsSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});
