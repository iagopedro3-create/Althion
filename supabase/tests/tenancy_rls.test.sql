begin;

create extension if not exists pgtap with schema extensions;
select plan(15);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.organizations where id = '10000000-0000-4000-8000-000000000001' $$,
  array[1::bigint],
  'owner can read own organization'
);

select results_eq(
  $$ select count(*) from public.organizations where id = '10000000-0000-4000-8000-000000000002' $$,
  array[0::bigint],
  'owner cannot read another organization'
);

select results_eq(
  $$ select count(*) from public.clinics where organization_id = '10000000-0000-4000-8000-000000000002' $$,
  array[0::bigint],
  'owner cannot enumerate another tenant clinics'
);

select results_eq(
  $$ select count(*) from public.integrations where organization_id = '10000000-0000-4000-8000-000000000002' $$,
  array[0::bigint],
  'owner cannot read another tenant integrations'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.clinics where id = '20000000-0000-4000-8000-000000000001' $$,
  array[1::bigint],
  'clinic manager can read assigned clinic'
);

select results_eq(
  $$ select count(*) from public.clinics where id = '20000000-0000-4000-8000-000000000002' $$,
  array[0::bigint],
  'clinic manager cannot read another tenant clinic'
);

select throws_ok(
  $$ select public.grant_membership(
    '10000000-0000-4000-8000-000000000001',
    (select id from public.profiles where auth_user_id = '80000000-0000-4000-8000-000000000005'),
    'viewer', null, null, 'manager-cannot-grant-001', 'rls-test-manager'
  ) $$,
  '42501',
  'Not authorized to manage memberships',
  'clinic manager cannot grant memberships'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.organizations where id = '10000000-0000-4000-8000-000000000001' $$,
  array[0::bigint],
  'viewer cannot read another tenant organization'
);

select throws_ok(
  $$ select public.grant_membership(
    '10000000-0000-4000-8000-000000000002',
    null,
    'viewer', null, null, 'viewer-cannot-grant-001', 'rls-test-viewer'
  ) $$,
  '42501',
  'Not authorized to manage memberships',
  'viewer cannot mutate memberships'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.organizations where id = '10000000-0000-4000-8000-000000000001' $$,
  array[1::bigint],
  'specialist can read assigned organization'
);

select results_eq(
  $$ select count(*) from public.organizations where id = '10000000-0000-4000-8000-000000000002' $$,
  array[0::bigint],
  'specialist cannot read unassigned organization'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

select is(
  public.grant_membership(
    '10000000-0000-4000-8000-000000000001',
    (select id from public.profiles where auth_user_id = '80000000-0000-4000-8000-000000000005'),
    'viewer', null, null, 'owner-grant-target-001', 'rls-test-owner'
  ),
  public.grant_membership(
    '10000000-0000-4000-8000-000000000001',
    (select id from public.profiles where auth_user_id = '80000000-0000-4000-8000-000000000005'),
    'viewer', null, null, 'owner-grant-target-001', 'rls-test-owner-replay'
  ),
  'grant membership is idempotent'
);

select results_eq(
  $$ select count(*) from public.audit_logs where action = 'membership.granted' and request_id = 'rls-test-owner' $$,
  array[1::bigint],
  'idempotent grant creates one audit event'
);

reset role;

select throws_ok(
  $$ insert into public.units (organization_id, clinic_id, name)
     values (
       '10000000-0000-4000-8000-000000000001',
       '20000000-0000-4000-8000-000000000002',
       'Cross tenant inválida'
     ) $$,
  '23503',
  'insert or update on table "units" violates foreign key constraint "units_organization_id_clinic_id_fkey"',
  'composite foreign key rejects cross-tenant relation'
);

update public.memberships
set status = 'revoked', revoked_at = now()
where id = '40000000-0000-4000-8000-000000000002';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.organizations where id = '10000000-0000-4000-8000-000000000001' $$,
  array[0::bigint],
  'revoked user loses tenant access immediately'
);

select * from finish();
rollback;
