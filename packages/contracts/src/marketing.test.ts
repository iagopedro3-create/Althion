import { describe, expect, it } from 'vitest';
import { saveGoogleAdsCredentialsSchema } from './marketing';

describe('google ads validation schemas', () => {
  it('validates correct google ads credentials input', () => {
    const valid = {
      refresh_token: 'mock_refresh_abc123xyz',
      developer_token: 'mock_developer_999',
      customer_id: '123-456-7890',
    };
    const parsed = saveGoogleAdsCredentialsSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid customer id formats', () => {
    const invalid = {
      refresh_token: 'mock_refresh_abc123xyz',
      developer_token: 'mock_developer_999',
      customer_id: 'invalid-customer-id',
    };
    const parsed = saveGoogleAdsCredentialsSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('rejects empty credentials fields', () => {
    const invalid = {
      refresh_token: '',
      developer_token: 'mock_developer_999',
      customer_id: '123-456-7890',
    };
    const parsed = saveGoogleAdsCredentialsSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('rejects credentials that could be real', () => {
    const parsed = saveGoogleAdsCredentialsSchema.safeParse({
      customer_id: '123-456-7890',
      developer_token: 'real-developer-token',
      refresh_token: '1/real-oauth-token',
    });

    expect(parsed.success).toBe(false);
  });

  it('rejects oversized synthetic credentials', () => {
    const parsed = saveGoogleAdsCredentialsSchema.safeParse({
      refresh_token: `mock_${'x'.repeat(600)}`,
      developer_token: 'mock_developer_999',
      customer_id: '123-456-7890',
    });

    expect(parsed.success).toBe(false);
  });
});
