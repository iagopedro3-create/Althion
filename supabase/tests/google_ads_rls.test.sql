begin;

create extension if not exists pgtap with schema extensions;
select plan(13);

-- 1. Check feature flag default
select results_eq(
  $$ select default_enabled from public.feature_flags where key = 'google.ads.v1' $$,
  array[false],
  'google ads feature flag is deny-by-default'
);

-- Set session context as Specialist (user 4)
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

-- 2-3. Secret columns are absent from the exposed schema
select hasnt_column(
  'public',
  'google_ads_credentials',
  'refresh_token',
  'refresh token is absent from the public credentials table'
);

select hasnt_column(
  'public',
  'google_ads_credentials',
  'developer_token',
  'developer token is absent from the public credentials table'
);

-- 4. Database rejects credentials that could be real
select throws_ok(
  $$ select public.save_google_ads_credentials(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'potentially-real-refresh-token',
    'potentially-real-developer-token',
    '123-456-7890',
    'idempotency-ads-real-001',
    'request-ads-real-001'
  ) $$,
  '22023',
  'Only synthetic sandbox credentials are accepted',
  'database rejects credentials that could be real'
);

-- 5. Specialist can save credentials
select lives_ok(
  $$ select public.save_google_ads_credentials(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'mock_refresh_token_123',
    'mock_dev_token_123',
    '123-456-7890',
    'idempotency-ads-001',
    'request-ads-001'
  ) $$,
  'specialist can save google ads credentials'
);

-- 6. Specialist can read safe connection metadata
select results_eq(
  $$ select customer_id from public.get_google_ads_connection(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001'
  ) $$,
  array['123-456-7890'],
  'specialist can read safe google ads connection metadata'
);

-- 7. Authenticated users cannot query the credential table directly
select throws_ok(
  $$ select 1 from public.google_ads_credentials $$,
  '42501',
  null,
  'credential table cannot be selected directly'
);

-- 8. Specialist can sync campaigns and metrics
select lives_ok(
  $$ select public.sync_google_ads_data(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '[{"campaign_id":"camp-1","name":"Campanha Teste","status":"ENABLED","budget_micros":10000000}]'::jsonb,
    '[{"campaign_id":"camp-1","date":"2026-07-17","clicks":150,"impressions":3000,"cost_micros":4500000,"conversions":12.5}]'::jsonb,
    'idempotency-sync-001',
    'request-sync-001'
  ) $$,
  'specialist can sync campaigns and metrics'
);

-- 9. Specialist can view campaigns
select results_eq(
  $$ select name from public.google_ads_campaigns where campaign_id = 'camp-1' $$,
  array['Campanha Teste'],
  'specialist can read campaigns'
);

-- 10. Specialist can view metrics
select results_eq(
  $$ select clicks, impressions from public.google_ads_metrics where campaign_id = 'camp-1' $$,
  $$ values (150, 3000) $$,
  'specialist can read synced metrics'
);

-- Set session context as Operator A (user 6, Clinic A)
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000006","role":"authenticated"}',
  true
);

-- 11. Operator A cannot read connection metadata
select throws_ok(
  $$ select * from public.get_google_ads_connection(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001'
  ) $$,
  '42501',
  'Manage Google Ads denied',
  'operator cannot read google ads connection metadata'
);

-- Set session context as Viewer B (user 3, Org B)
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);

-- 12. Viewer B from Org B cannot read Org A's connection metadata
select throws_ok(
  $$ select * from public.get_google_ads_connection(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001'
  ) $$,
  '42501',
  'Manage Google Ads denied',
  'tenant isolation: user from Org B cannot read Org A connection metadata'
);

-- 13. Viewer B from Org B cannot read Org A's campaigns
select is_empty(
  $$ select 1 from public.google_ads_campaigns where campaign_id = 'camp-1' $$,
  'tenant isolation: user from Org B cannot read Org A campaigns'
);

rollback;
