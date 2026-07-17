begin;

create extension if not exists pgtap with schema extensions;
select plan(9);

-- 1. Check feature flag default
select results_eq(
  $$ select default_enabled from public.feature_flags where key = 'google.ads.v1' $$,
  array[false],
  'google ads feature flag is deny-by-default'
);

create temporary table ads_ids (
  cred_id uuid
);
grant select, insert, update on ads_ids to authenticated;
insert into ads_ids default values;

-- Set session context as Specialist (user 4)
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

-- 2. Specialist can save credentials
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

update ads_ids set cred_id = (
  select id from public.google_ads_credentials
  where customer_id = '123-456-7890'
);

-- 3. Specialist can sync campaigns and metrics
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

-- 4. Specialist can view credentials
select results_eq(
  $$ select customer_id from public.google_ads_credentials where id = (select cred_id from ads_ids) $$,
  array['123-456-7890'],
  'specialist can read google ads credentials'
);

-- 5. Specialist can view campaigns
select results_eq(
  $$ select name from public.google_ads_campaigns where campaign_id = 'camp-1' $$,
  array['Campanha Teste'],
  'specialist can read campaigns'
);

-- 6. Specialist can view metrics
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

-- 7. Operator A cannot read credentials (restricted data)
select is_empty(
  $$ select 1 from public.google_ads_credentials where id = (select cred_id from ads_ids) $$,
  'operator cannot read google ads credentials'
);

-- Set session context as Viewer B (user 3, Org B)
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);

-- 8. Viewer B from Org B cannot read Org A's credentials
select is_empty(
  $$ select 1 from public.google_ads_credentials where id = (select cred_id from ads_ids) $$,
  'tenant isolation: user from Org B cannot read Org A credentials'
);

-- 9. Viewer B from Org B cannot read Org A's campaigns
select is_empty(
  $$ select 1 from public.google_ads_campaigns where campaign_id = 'camp-1' $$,
  'tenant isolation: user from Org B cannot read Org A campaigns'
);

rollback;
