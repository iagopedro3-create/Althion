begin;

create extension if not exists pgtap with schema extensions;
select plan(36);

create temporary table phase3_ids (
  request_id uuid,
  doctor_request_id uuid,
  plan_id uuid,
  second_plan_id uuid,
  task_id uuid
);
grant select, insert, update on phase3_ids to authenticated;
insert into phase3_ids default values;

select results_eq(
  $$ select default_enabled from public.feature_flags where key = 'portal.client.v1' $$,
  array[false],
  'client portal feature flag is deny-by-default'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

update phase3_ids
set request_id = public.create_portal_request(
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'data_quality',
  'Revisar cobertura do Radar',
  'Revisar a cobertura declarada sem inserir dados de pacientes.',
  'high',
  'phase3-owner-request-key-0001',
  'phase3-owner-request-create'
);

select results_eq(
  $$ select status::text, priority::text from public.requests where id = (select request_id from phase3_ids) $$,
  $$ values ('open'::text, 'high'::text) $$,
  'owner creates a source-safe operational request'
);

select is(
  public.create_portal_request(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'data_quality',
    'Revisar cobertura do Radar',
    'Revisar a cobertura declarada sem inserir dados de pacientes.',
    'high',
    'phase3-owner-request-key-0001',
    'phase3-owner-request-replay'
  ),
  (select request_id from phase3_ids),
  'request creation is idempotent'
);

select throws_ok(
  $$ select public.create_portal_request(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'data_quality',
    'Outro assunto administrativo',
    'O mesmo identificador não pode representar outra solicitação.',
    'high',
    'phase3-owner-request-key-0001',
    'phase3-owner-request-conflict'
  ) $$,
  '22023',
  'Idempotency key reused with different payload',
  'idempotency key cannot be reused with a different request'
);

update phase3_ids
set plan_id = public.create_improvement_plan(
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'Plano administrativo do trimestre',
  null,
  '2026-07-01',
  '2026-09-30',
  'phase3-owner-plan-key-00001',
  'phase3-owner-plan-create'
);

select results_eq(
  $$ select version, status::text from public.improvement_plans where id = (select plan_id from phase3_ids) $$,
  $$ values (1, 'draft'::text) $$,
  'first improvement plan starts as version one draft'
);

select results_eq(
  $$ select count(*) from public.improvement_plan_status_history where improvement_plan_id = (select plan_id from phase3_ids) $$,
  array[1::bigint],
  'plan creation records append-only history'
);

update phase3_ids
set task_id = public.create_portal_task(
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  plan_id,
  'Padronizar acompanhamento de leads',
  'high',
  null,
  '2026-08-15T18:00:00Z',
  null,
  'phase3-owner-task-key-00001',
  'phase3-owner-task-create'
);

select results_eq(
  $$ select status::text, priority::text from public.tasks where id = (select task_id from phase3_ids) $$,
  $$ values ('todo'::text, 'high'::text) $$,
  'owner creates an administrative plan task'
);

select results_eq(
  $$ select count(*) from public.task_status_history where task_id = (select task_id from phase3_ids) $$,
  array[1::bigint],
  'task creation records append-only history'
);

select is(
  public.transition_improvement_plan(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select plan_id from phase3_ids),
    'active',
    'approved_for_execution',
    'phase3-owner-plan-active-001',
    'phase3-owner-plan-activate'
  ),
  (select plan_id from phase3_ids),
  'owner activates the improvement plan'
);

select results_eq(
  $$ select status::text, activated_at is not null from public.improvement_plans where id = (select plan_id from phase3_ids) $$,
  $$ values ('active'::text, true) $$,
  'active plan preserves activation timestamp'
);

select is(
  public.transition_portal_task(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select task_id from phase3_ids),
    'completed',
    'administrative_action_completed',
    'phase3-owner-task-done-0001',
    'phase3-owner-task-complete'
  ),
  (select task_id from phase3_ids),
  'owner completes an eligible plan task'
);

select results_eq(
  $$ select status::text, completed_at is not null from public.tasks where id = (select task_id from phase3_ids) $$,
  $$ values ('completed'::text, true) $$,
  'completed task preserves completion timestamp'
);

select throws_ok(
  $$ select public.transition_portal_request(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select request_id from phase3_ids),
    'resolved',
    'invalid_shortcut',
    'phase3-owner-invalid-request',
    'phase3-owner-invalid-transition'
  ) $$,
  '23514',
  'Invalid portal request transition',
  'request workflow rejects an invalid shortcut'
);

update phase3_ids
set second_plan_id = public.create_improvement_plan(
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'Segundo plano administrativo',
  null,
  null,
  null,
  'phase3-owner-plan-key-00002',
  'phase3-owner-plan-create-2'
);

select throws_ok(
  $$ select public.transition_improvement_plan(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select second_plan_id from phase3_ids),
    'active',
    'conflicting_active_plan',
    'phase3-owner-plan-active-002',
    'phase3-owner-plan-activate-2'
  ) $$,
  '23505',
  null,
  'database enforces one active plan per clinic'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.requests where id = (select request_id from phase3_ids) $$,
  array[1::bigint],
  'scoped manager reads requests in the assigned clinic'
);

select is(
  public.transition_portal_request(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select request_id from phase3_ids),
    'acknowledged',
    'accepted_by_relationship_team',
    'phase3-manager-request-ack-001',
    'phase3-manager-request-transition'
  ),
  (select request_id from phase3_ids),
  'manager acknowledges a clinic request'
);

select results_eq(
  $$ select count(*) from public.request_status_history where request_id = (select request_id from phase3_ids) $$,
  array[2::bigint],
  'request transition is traceable in history'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000007","role":"authenticated"}',
  true
);

update phase3_ids
set doctor_request_id = public.create_portal_request(
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'meeting',
  'Reunião operacional mensal',
  'Solicito alinhamento sobre o processo administrativo da agenda.',
  'normal',
  'phase3-doctor-request-key-01',
  'phase3-doctor-request-create'
);

select is(
  (select doctor_request_id from phase3_ids),
  (select id from public.requests limit 1),
  'doctor creates an administrative request in the assigned clinic'
);

select results_eq(
  $$ select count(*) from public.requests $$,
  array[1::bigint],
  'doctor reads only their own requests'
);

select results_eq(
  $$ select count(*) from public.improvement_plans where status = 'active' $$,
  array[1::bigint],
  'doctor reads the active improvement plan'
);

select throws_ok(
  $$ select public.transition_portal_request(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select doctor_request_id from phase3_ids),
    'acknowledged',
    null,
    'phase3-doctor-transition-001',
    'phase3-doctor-transition'
  ) $$,
  '42501',
  'Portal request management denied',
  'doctor cannot manage request workflow'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000008","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.requests $$,
  array[2::bigint],
  'viewer reads clinic requests without changing them'
);

select results_eq(
  $$ select (select count(*) from public.improvement_plans), (select count(*) from public.tasks) $$,
  $$ values (2::bigint, 1::bigint) $$,
  'viewer reads plans and tasks in the clinic scope'
);

select throws_ok(
  $$ select public.create_portal_request(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'other',
    'Solicitação somente leitura',
    'Viewer não pode criar ou alterar dados do Portal.',
    'normal',
    'phase3-viewer-create-key-001',
    'phase3-viewer-create'
  ) $$,
  '42501',
  'Portal request access denied',
  'viewer cannot create requests'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000006","role":"authenticated"}',
  true
);

select results_eq(
  $$ select (select count(*) from public.requests), (select count(*) from public.improvement_plans) $$,
  $$ values (0::bigint, 0::bigint) $$,
  'operator cannot read managerial Portal data'
);

select throws_ok(
  $$ select public.create_portal_request(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'other',
    'Solicitação de operador',
    'Operador não possui capability do Portal gerencial.',
    'normal',
    'phase3-operator-create-key01',
    'phase3-operator-create'
  ) $$,
  '42501',
  'Portal request access denied',
  'operator cannot create Portal requests'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.requests $$,
  array[2::bigint],
  'assigned relationship specialist reads clinic requests'
);

select is(
  public.transition_portal_request(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select request_id from phase3_ids),
    'in_progress',
    'work_started',
    'phase3-specialist-transition1',
    'phase3-specialist-request-transition'
  ),
  (select request_id from phase3_ids),
  'assigned specialist manages request workflow'
);

reset role;
update public.relationship_assignments
set status = 'ended', ends_at = now()
where specialist_id = '50000000-0000-4000-8000-000000000001'
  and organization_id = '10000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

select results_eq(
  $$ select (select count(*) from public.requests), (select count(*) from public.tasks) $$,
  $$ values (0::bigint, 0::bigint) $$,
  'ended assignment immediately removes specialist read access'
);

select throws_ok(
  $$ select public.transition_portal_request(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select request_id from phase3_ids),
    'waiting_customer',
    null,
    'phase3-ended-specialist-key',
    'phase3-ended-specialist-transition'
  ) $$,
  '42501',
  'Portal request management denied',
  'ended assignment removes specialist mutation access'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.requests where organization_id = '10000000-0000-4000-8000-000000000001' $$,
  array[0::bigint],
  'viewer from another tenant cannot enumerate Portal requests'
);

select throws_ok(
  $$ select public.create_portal_request(
    '10000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'other',
    'Solicitação no tenant B',
    'Viewer continua sem permissão de escrita no próprio tenant.',
    'normal',
    'phase3-viewer-b-create-key1',
    'phase3-viewer-b-create'
  ) $$,
  '42501',
  'Portal request access denied',
  'viewer cannot create requests even in their own tenant'
);

reset role;

select throws_ok(
  $$ insert into public.requests (
    organization_id, clinic_id, requester_profile_id, category, subject, details
  ) values (
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    (select id from public.profiles where auth_user_id = '80000000-0000-4000-8000-000000000001'),
    'other', 'Cross tenant', 'Esta linha deve ser rejeitada pela chave composta.'
  ) $$,
  '23503',
  'insert or update on table "requests" violates foreign key constraint "requests_organization_id_clinic_id_fkey"',
  'composite foreign key rejects cross-tenant Portal request'
);

select throws_ok(
  $$ update public.task_status_history set reason_code = 'changed' where task_id = (select task_id from phase3_ids) $$,
  '55000',
  'Portal history is append-only',
  'task status history cannot be altered'
);

select results_eq(
  $$ select count(*), bool_or(metadata_redacted ? 'subject' or metadata_redacted ? 'details')
     from public.audit_logs where request_id like 'phase3-%' $$,
  $$ values (9::bigint, false) $$,
  'Portal commands are audited without request text'
);

select results_eq(
  $$ select count(*) from public.idempotency_records
     where scope like 'portal.%' and status = 'completed' $$,
  array[9::bigint],
  'successful Portal commands leave completed idempotency records'
);

select * from finish();
rollback;
