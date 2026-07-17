begin;

create extension if not exists pgtap with schema extensions;
select plan(28);

create temporary table phase5_ids (
  simulation_id uuid,
  opportunity_id uuid,
  action_id uuid,
  suppression_id uuid
);
grant select, insert, update on phase5_ids to authenticated;
insert into phase5_ids default values;

select results_eq(
  $$ select default_enabled from public.feature_flags where key = 'recovery.engine.v1' $$,
  array[false],
  'recovery feature flag is deny-by-default'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

select lives_ok(
  $$ select public.set_recovery_consent(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'mock-lead-01',
    'granted',
    'phase5-spec-consent-key-0001',
    'phase5-spec-consent-1'
  ) $$,
  'assigned specialist registers granted consent'
);

update phase5_ids
set simulation_id = public.run_recovery_simulation(
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '1.0.0-provisional',
  '2026-06-17T00:00:00Z',
  '2026-07-17T00:00:00Z',
  5,
  '[{"rule_code":"lead_no_response","rule_version":"1.0.0-provisional","external_lead_ref":"mock-lead-01","lead_label":"Lead sintetico 01","action_type":"contact_lead","evidence":{"received_at":"2026-07-15T00:00:00Z"}}]'::jsonb,
  '[{"external_lead_ref":"mock-lead-09","rule_code":"lead_no_response","reason":"excluded_no_consent"}]'::jsonb,
  'phase5-spec-simulation-key-1',
  'phase5-spec-simulation-1'
);

select results_eq(
  $$ select leads_evaluated, opportunities_identified, excluded_no_consent
     from public.recovery_simulations where id = (select simulation_id from phase5_ids) $$,
  $$ values (5, 1, 1) $$,
  'simulation persists explainable counters'
);

select is(
  public.run_recovery_simulation(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '1.0.0-provisional',
    '2026-06-17T00:00:00Z',
    '2026-07-17T00:00:00Z',
    5,
    '[{"rule_code":"lead_no_response","rule_version":"1.0.0-provisional","external_lead_ref":"mock-lead-01","lead_label":"Lead sintetico 01","action_type":"contact_lead","evidence":{"received_at":"2026-07-15T00:00:00Z"}}]'::jsonb,
    '[{"external_lead_ref":"mock-lead-09","rule_code":"lead_no_response","reason":"excluded_no_consent"}]'::jsonb,
    'phase5-spec-simulation-key-1',
    'phase5-spec-simulation-1b'
  ),
  (select simulation_id from phase5_ids),
  'simulation is idempotent for the same payload'
);

update phase5_ids set opportunity_id = (
  select id from public.recovery_opportunities
  where simulation_id = (select simulation_id from phase5_ids)
);
update phase5_ids set action_id = (
  select id from public.recovery_actions
  where opportunity_id = (select opportunity_id from phase5_ids)
);

select results_eq(
  $$ select o.status::text, a.status::text
     from public.recovery_opportunities o
     join public.recovery_actions a on a.opportunity_id = o.id
     where o.id = (select opportunity_id from phase5_ids) $$,
  $$ values ('identified'::text, 'recommended'::text) $$,
  'simulation creates identified opportunity with recommended action'
);

select throws_ok(
  $$ select public.run_recovery_simulation(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '1.0.0-provisional',
    '2026-06-17T00:00:00Z',
    '2026-07-17T00:00:00Z',
    1,
    '[{"rule_code":"lead_no_response","rule_version":"1.0.0-provisional","external_lead_ref":"mock-lead-77","lead_label":null,"action_type":"contact_lead","evidence":{}}]'::jsonb,
    '[]'::jsonb,
    'phase5-spec-simulation-key-2',
    'phase5-spec-simulation-2'
  ) $$,
  '23514',
  'Candidate without granted consent',
  'database re-validates consent before persisting a candidate'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.recovery_opportunities $$,
  array[1::bigint],
  'organization owner reads recovery opportunities'
);

select throws_ok(
  $$ select public.run_recovery_simulation(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '1.0.0-provisional',
    '2026-06-17T00:00:00Z',
    '2026-07-17T00:00:00Z',
    0,
    '[]'::jsonb,
    '[]'::jsonb,
    'phase5-owner-simulation-key1',
    'phase5-owner-simulation'
  ) $$,
  '42501',
  'Recovery simulation denied',
  'owner cannot run simulations'
);

select is(
  public.decide_recovery_opportunity(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select opportunity_id from phase5_ids),
    'approved',
    'client_context_confirmed',
    'phase5-owner-opp-decide-0001',
    'phase5-owner-opp-decide'
  ),
  (select opportunity_id from phase5_ids),
  'owner approves an identified opportunity'
);

select results_eq(
  $$ select status::text, decided_at is not null from public.recovery_opportunities
     where id = (select opportunity_id from phase5_ids) $$,
  $$ values ('approved'::text, true) $$,
  'opportunity decision is recorded with decider timestamp'
);

select throws_ok(
  $$ select public.decide_recovery_opportunity(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select opportunity_id from phase5_ids),
    'discarded',
    null,
    'phase5-owner-opp-decide-0002',
    'phase5-owner-opp-decide-2'
  ) $$,
  '23514',
  'Opportunity already decided',
  'opportunity decisions are terminal'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

select is(
  public.decide_recovery_action(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select action_id from phase5_ids),
    'approved',
    'aligned_with_account_owner',
    'phase5-spec-action-decide-01',
    'phase5-spec-action-decide'
  ),
  (select action_id from phase5_ids),
  'specialist approves the recommended action after opportunity approval'
);

select lives_ok(
  $$ select public.set_recovery_consent(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'mock-lead-02',
    'granted',
    'phase5-spec-consent-key-0002',
    'phase5-spec-consent-2'
  ) $$,
  'specialist registers consent for a second synthetic lead'
);

update phase5_ids
set suppression_id = public.create_recovery_suppression(
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'mock-lead-02',
  'opt_out',
  null,
  'phase5-spec-suppress-key-001',
  'phase5-spec-suppress'
);

select results_eq(
  $$ select reason::text, revoked_at is null from public.recovery_suppressions
     where id = (select suppression_id from phase5_ids) $$,
  $$ values ('opt_out'::text, true) $$,
  'specialist registers an active opt-out suppression'
);

select throws_ok(
  $$ select public.create_recovery_suppression(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'mock-lead-02',
    'complaint',
    null,
    'phase5-spec-suppress-key-002',
    'phase5-spec-suppress-2'
  ) $$,
  '23505',
  null,
  'only one active suppression per lead is allowed'
);

select throws_ok(
  $$ select public.run_recovery_simulation(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '1.0.0-provisional',
    '2026-06-17T00:00:00Z',
    '2026-07-17T00:00:00Z',
    1,
    '[{"rule_code":"attended_no_booking","rule_version":"1.0.0-provisional","external_lead_ref":"mock-lead-02","lead_label":null,"action_type":"offer_booking","evidence":{}}]'::jsonb,
    '[]'::jsonb,
    'phase5-spec-simulation-key-3',
    'phase5-spec-simulation-3'
  ) $$,
  '23514',
  'Candidate is suppressed',
  'database re-validates suppression before persisting a candidate'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000007","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.recovery_opportunities $$,
  array[0::bigint],
  'doctor cannot read recovery data'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000008","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.recovery_simulations $$,
  array[0::bigint],
  'viewer cannot read simulations'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000006","role":"authenticated"}',
  true
);

select throws_ok(
  $$ select public.decide_recovery_opportunity(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select opportunity_id from phase5_ids),
    'discarded',
    null,
    'phase5-operator-decide-key01',
    'phase5-operator-decide'
  ) $$,
  '42501',
  'Recovery decision denied',
  'operator cannot decide recovery workflows'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.recovery_opportunities
     where organization_id = '10000000-0000-4000-8000-000000000001' $$,
  array[0::bigint],
  'tenant B viewer cannot enumerate tenant A recovery data'
);

select throws_ok(
  $$ select public.create_recovery_suppression(
    '10000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'mock-lead-03',
    'opt_out',
    null,
    'phase5-viewer-b-suppress-k1',
    'phase5-viewer-b-suppress'
  ) $$,
  '42501',
  'Recovery suppression denied',
  'viewer cannot manage suppressions in their own tenant'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

select is(
  public.revoke_recovery_suppression(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select suppression_id from phase5_ids),
    'phase5-spec-suppress-rev-001',
    'phase5-spec-suppress-revoke'
  ),
  (select suppression_id from phase5_ids),
  'specialist revokes a suppression with audit trail'
);

reset role;

select throws_ok(
  $$ insert into public.recovery_opportunities (
    organization_id, clinic_id, simulation_id, rule_code, rule_version,
    external_lead_ref, expires_at
  ) values (
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    (select simulation_id from phase5_ids),
    'lead_no_response', '1.0.0-provisional', 'mock-lead-05', now() + interval '14 days'
  ) $$,
  '23503',
  null,
  'composite foreign keys reject cross-tenant recovery rows'
);

select throws_ok(
  $$ update public.recovery_opportunity_status_history set reason_code = 'changed'
     where opportunity_id = (select opportunity_id from phase5_ids) $$,
  '55000',
  'Cockpit history is append-only',
  'recovery history cannot be altered'
);

select results_eq(
  $$ select count(*), bool_or(
       metadata_redacted ? 'lead_label'
       or metadata_redacted ? 'evidence'
       or metadata_redacted ? 'external_lead_ref'
     )
     from public.audit_logs where request_id like 'phase5-%' $$,
  $$ values (7::bigint, false) $$,
  'recovery commands are audited without lead payloads'
);

select results_eq(
  $$ select count(*) from public.idempotency_records
     where scope like 'recovery.%' and status = 'completed' $$,
  array[7::bigint],
  'successful recovery commands leave completed idempotency records'
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
  $$ select (select count(*) from public.recovery_opportunities where organization_id = '10000000-0000-4000-8000-000000000001'),
            (select count(*) from public.recovery_simulations where organization_id = '10000000-0000-4000-8000-000000000001') $$,
  $$ values (0::bigint, 0::bigint) $$,
  'ended assignment immediately removes specialist recovery access'
);

select throws_ok(
  $$ select public.run_recovery_simulation(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '1.0.0-provisional',
    '2026-06-17T00:00:00Z',
    '2026-07-17T00:00:00Z',
    0,
    '[]'::jsonb,
    '[]'::jsonb,
    'phase5-ended-spec-key-00001',
    'phase5-ended-spec-simulation'
  ) $$,
  '42501',
  'Recovery simulation denied',
  'ended assignment removes simulation access'
);

select * from finish();
rollback;
