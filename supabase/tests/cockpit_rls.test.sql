begin;

create extension if not exists pgtap with schema extensions;
select plan(27);

create temporary table phase4_ids (
  incident_id uuid,
  meeting_id uuid
);
grant select, insert, update on phase4_ids to authenticated;
insert into phase4_ids default values;

select results_eq(
  $$ select default_enabled from public.feature_flags where key = 'cockpit.specialist.v1' $$,
  array[false],
  'cockpit feature flag is deny-by-default'
);

select results_eq(
  $$ select complexity::text from public.relationship_assignments
     where specialist_id = '50000000-0000-4000-8000-000000000001'
       and organization_id = '10000000-0000-4000-8000-000000000001' $$,
  array['standard'],
  'existing assignments receive the standard complexity default'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

update phase4_ids
set incident_id = public.create_account_incident(
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'data_quality',
  'high',
  'Cobertura do Radar em queda',
  'Cobertura declarada caiu sem justificativa administrativa conhecida.',
  'phase4-spec-incident-key-001',
  'phase4-spec-incident-create'
);

select results_eq(
  $$ select status::text, severity::text from public.account_incidents where id = (select incident_id from phase4_ids) $$,
  $$ values ('open'::text, 'high'::text) $$,
  'assigned specialist opens an operational incident'
);

select is(
  public.create_account_incident(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'data_quality',
    'high',
    'Cobertura do Radar em queda',
    'Cobertura declarada caiu sem justificativa administrativa conhecida.',
    'phase4-spec-incident-key-001',
    'phase4-spec-incident-replay'
  ),
  (select incident_id from phase4_ids),
  'incident creation is idempotent'
);

select throws_ok(
  $$ select public.create_account_incident(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'operational',
    'low',
    'Outro incidente operacional',
    'A mesma chave não pode representar outro incidente.',
    'phase4-spec-incident-key-001',
    'phase4-spec-incident-conflict'
  ) $$,
  '22023',
  'Idempotency key reused with different payload',
  'idempotency key cannot be reused with a different incident'
);

select results_eq(
  $$ select count(*) from public.account_incident_status_history where incident_id = (select incident_id from phase4_ids) $$,
  array[1::bigint],
  'incident creation records append-only history'
);

select is(
  public.transition_account_incident(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select incident_id from phase4_ids),
    'investigating',
    'triage_started',
    'phase4-spec-incident-ack-001',
    'phase4-spec-incident-transition'
  ),
  (select incident_id from phase4_ids),
  'assigned specialist acknowledges the incident'
);

select results_eq(
  $$ select status::text, acknowledged_at is not null from public.account_incidents where id = (select incident_id from phase4_ids) $$,
  $$ values ('investigating'::text, true) $$,
  'acknowledgement timestamp is preserved on the incident'
);

select throws_ok(
  $$ select public.transition_account_incident(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select incident_id from phase4_ids),
    'open',
    'invalid_rollback',
    'phase4-spec-incident-bad-001',
    'phase4-spec-incident-invalid'
  ) $$,
  '23514',
  'Invalid incident transition',
  'incident workflow rejects an invalid rollback'
);

update phase4_ids
set meeting_id = public.create_account_meeting(
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'checkin',
  '2026-07-20T14:00:00Z',
  null,
  'phase4-spec-meeting-key-0001',
  'phase4-spec-meeting-create'
);

select results_eq(
  $$ select status::text, purpose::text from public.account_meetings where id = (select meeting_id from phase4_ids) $$,
  $$ values ('scheduled'::text, 'checkin'::text) $$,
  'assigned specialist schedules an account meeting'
);

select is(
  public.transition_account_meeting(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select meeting_id from phase4_ids),
    'completed',
    'client_attended',
    'Alinhamento administrativo concluído sem pendências.',
    'phase4-spec-meeting-done-001',
    'phase4-spec-meeting-complete'
  ),
  (select meeting_id from phase4_ids),
  'assigned specialist completes the meeting'
);

select results_eq(
  $$ select status::text, completed_at is not null, summary is not null from public.account_meetings where id = (select meeting_id from phase4_ids) $$,
  $$ values ('completed'::text, true, true) $$,
  'completed meeting preserves completion timestamp and summary'
);

select throws_ok(
  $$ select public.transition_account_meeting(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select meeting_id from phase4_ids),
    'cancelled',
    null,
    null,
    'phase4-spec-meeting-bad-0001',
    'phase4-spec-meeting-invalid'
  ) $$,
  '23514',
  'Invalid meeting transition',
  'meeting workflow is terminal after completion'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.account_incidents $$,
  array[0::bigint],
  'organization owner cannot read internal incidents'
);

select throws_ok(
  $$ select public.create_account_incident(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'operational',
    'medium',
    'Incidente aberto pelo owner',
    'Papéis do cliente não possuem acesso ao Cockpit interno.',
    'phase4-owner-incident-key-01',
    'phase4-owner-incident-create'
  ) $$,
  '42501',
  'Cockpit incident access denied',
  'organization owner cannot open Cockpit incidents'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.account_meetings $$,
  array[0::bigint],
  'clinic manager cannot read internal meetings'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000007","role":"authenticated"}',
  true
);

select throws_ok(
  $$ select public.create_account_incident(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'other',
    'low',
    'Incidente aberto pelo doctor',
    'Doctor não possui capability de incidente do Cockpit.',
    'phase4-doctor-incident-key-1',
    'phase4-doctor-incident-create'
  ) $$,
  '42501',
  'Cockpit incident access denied',
  'doctor cannot open Cockpit incidents'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000008","role":"authenticated"}',
  true
);

select results_eq(
  $$ select (select count(*) from public.account_incidents), (select count(*) from public.account_meetings) $$,
  $$ values (0::bigint, 0::bigint) $$,
  'viewer cannot read incidents or meetings'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000006","role":"authenticated"}',
  true
);

select throws_ok(
  $$ select public.create_account_meeting(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'checkin',
    '2026-07-21T14:00:00Z',
    null,
    'phase4-operator-meeting-key1',
    'phase4-operator-meeting'
  ) $$,
  '42501',
  'Cockpit meeting access denied',
  'operator cannot schedule Cockpit meetings'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.account_incidents where organization_id = '10000000-0000-4000-8000-000000000001' $$,
  array[0::bigint],
  'tenant B viewer cannot enumerate tenant A incidents'
);

select throws_ok(
  $$ select public.create_account_incident(
    '10000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'other',
    'low',
    'Incidente aberto no tenant B',
    'Viewer não possui capability de Cockpit no próprio tenant.',
    'phase4-viewer-b-incident-k1',
    'phase4-viewer-b-incident'
  ) $$,
  '42501',
  'Cockpit incident access denied',
  'tenant viewer cannot open incidents in their own tenant'
);

reset role;

select throws_ok(
  $$ insert into public.account_incidents (
    organization_id, clinic_id, opened_by_profile_id, category, severity, subject, details
  ) values (
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    (select id from public.profiles where auth_user_id = '80000000-0000-4000-8000-000000000004'),
    'other', 'medium', 'Cross tenant', 'Esta linha deve ser rejeitada pela chave composta.'
  ) $$,
  '23503',
  'insert or update on table "account_incidents" violates foreign key constraint "account_incidents_organization_id_clinic_id_fkey"',
  'composite foreign key rejects cross-tenant incidents'
);

select throws_ok(
  $$ update public.account_incident_status_history set reason_code = 'changed'
     where incident_id = (select incident_id from phase4_ids) $$,
  '55000',
  'Cockpit history is append-only',
  'incident history cannot be altered'
);

select results_eq(
  $$ select count(*), bool_or(
       metadata_redacted ? 'subject'
       or metadata_redacted ? 'details'
       or metadata_redacted ? 'summary'
     )
     from public.audit_logs where request_id like 'phase4-%' $$,
  $$ values (4::bigint, false) $$,
  'Cockpit commands are audited without free text'
);

select results_eq(
  $$ select count(*) from public.idempotency_records
     where scope like 'cockpit.%' and status = 'completed' $$,
  array[4::bigint],
  'successful Cockpit commands leave completed idempotency records'
);

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
  $$ select (select count(*) from public.account_incidents), (select count(*) from public.account_meetings) $$,
  $$ values (0::bigint, 0::bigint) $$,
  'ended assignment immediately removes specialist Cockpit access'
);

select throws_ok(
  $$ select public.transition_account_incident(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select incident_id from phase4_ids),
    'resolved',
    null,
    'phase4-ended-spec-key-00001',
    'phase4-ended-spec-transition'
  ) $$,
  '42501',
  'Cockpit incident management denied',
  'ended assignment removes specialist mutation access'
);

select * from finish();
rollback;
