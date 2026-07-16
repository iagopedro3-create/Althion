begin;

create extension if not exists pgtap with schema extensions;
select plan(22);

create temporary table phase2_ids (
  assessment_id uuid,
  score_id uuid,
  incomplete_assessment_id uuid,
  incomplete_score_id uuid
);
grant select, insert, update on phase2_ids to authenticated;
insert into phase2_ids default values;

select is(
  (select sum(weight) from public.althion_score_formula_components
   where formula_id = '61000000-0000-4000-8000-000000000001'),
  100.00::numeric,
  'provisional formula weights sum to 100'
);

select results_eq(
  $$ select status::text from public.althion_score_formulas where id = '61000000-0000-4000-8000-000000000001' $$,
  array['draft'::text],
  'provisional formula remains draft'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

update phase2_ids
set assessment_id = public.create_radar_assessment(
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  '2026-06-01',
  '2026-06-30',
  '[
    {"code":"first_response_within_sla","numerator":80,"denominator":100,"source":"manual","quality":"declared"},
    {"code":"lead_to_appointment","numerator":80,"denominator":100,"source":"manual","quality":"declared"},
    {"code":"follow_up_within_policy","numerator":80,"denominator":100,"source":"manual","quality":"declared"},
    {"code":"bookable_slot_occupancy","numerator":80,"denominator":100,"source":"manual","quality":"declared"},
    {"code":"appointment_attendance","numerator":80,"denominator":100,"source":"manual","quality":"declared"},
    {"code":"worked_opportunity_recovery","numerator":80,"denominator":100,"source":"manual","quality":"declared"},
    {"code":"administrative_return","numerator":80,"denominator":100,"source":"manual","quality":"declared"},
    {"code":"required_data_quality","numerator":80,"denominator":100,"source":"manual","quality":"declared"}
  ]'::jsonb,
  'phase2-owner-create-0001',
  'phase2-test-create'
);

select results_eq(
  $$ select count(*) from public.radar_metric_inputs where assessment_id = (select assessment_id from phase2_ids) $$,
  array[8::bigint],
  'owner creates a Radar draft with eight traceable inputs'
);

select is(
  public.create_radar_assessment(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    '2026-06-01', '2026-06-30',
    (select jsonb_agg(jsonb_build_object(
      'code', metric_code,
      'numerator', numerator,
      'denominator', denominator,
      'source', source,
      'quality', quality
    ) order by metric_code) from public.radar_metric_inputs
      where assessment_id = (select assessment_id from phase2_ids)),
    'phase2-owner-create-0001',
    'phase2-test-create-replay'
  ),
  (select assessment_id from phase2_ids),
  'Radar create command is idempotent'
);

select throws_ok(
  $$ select public.create_radar_assessment(
    '10000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    null, '2026-06-01', '2026-06-30',
    '[{"code":"first_response_within_sla","numerator":1,"denominator":1,"source":"manual","quality":"declared"}]'::jsonb,
    'phase2-cross-tenant-0001', 'phase2-test-cross'
  ) $$,
  '42501',
  'Not authorized to write Radar assessments',
  'owner cannot create a Radar assessment in another tenant'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.radar_assessments where id = (select assessment_id from phase2_ids) $$,
  array[1::bigint],
  'clinic manager reads Radar in assigned clinic'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000006","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.radar_assessments where id = (select assessment_id from phase2_ids) $$,
  array[0::bigint],
  'operator cannot read Radar even in an assigned clinic'
);

select throws_ok(
  $$ select public.submit_radar_assessment(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select assessment_id from phase2_ids),
    'phase2-operator-submit-1', 'phase2-operator-submit'
  ) $$,
  '42501',
  'Not authorized to submit Radar assessments',
  'operator cannot submit Radar'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.radar_assessments where id = (select assessment_id from phase2_ids) $$,
  array[1::bigint],
  'assigned relationship specialist reads Radar'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

update phase2_ids
set score_id = public.submit_radar_assessment(
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  assessment_id,
  'phase2-owner-submit-001',
  'phase2-test-submit'
);

select is(
  public.submit_radar_assessment(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select assessment_id from phase2_ids),
    'phase2-owner-submit-replay',
    'phase2-test-submit-replay'
  ),
  (select score_id from phase2_ids),
  'submitting an already submitted assessment returns the immutable score'
);

select results_eq(
  $$ select status::text, score_value, coverage from public.althion_scores where id = (select score_id from phase2_ids) $$,
  $$ values ('calculated'::text, 80.00::numeric, 100.00::numeric) $$,
  'complete inputs produce the expected provisional score'
);

select results_eq(
  $$ select count(*) from public.althion_score_evidence where score_id = (select score_id from phase2_ids) $$,
  array[8::bigint],
  'score preserves one evidence record per dimension'
);

select results_eq(
  $$ select count(*) from public.radar_recommendations where score_id = (select score_id from phase2_ids) $$,
  array[8::bigint],
  'provisional deterministic rules create recommendations for visible gaps'
);

select throws_ok(
  $$ select public.replace_radar_assessment(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select assessment_id from phase2_ids), null,
    '2026-06-01', '2026-06-30',
    '[{"code":"first_response_within_sla","numerator":1,"denominator":1,"source":"manual","quality":"declared"}]'::jsonb,
    'phase2-replace-submitted'
  ) $$,
  '55000',
  'Submitted Radar assessments are immutable',
  'submitted assessment cannot be edited'
);

update phase2_ids
set incomplete_assessment_id = public.create_radar_assessment(
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  null, '2026-05-01', '2026-05-31',
  '[
    {"code":"first_response_within_sla","numerator":50,"denominator":100,"source":"manual","quality":"declared"},
    {"code":"follow_up_within_policy","numerator":50,"denominator":100,"source":"manual","quality":"declared"},
    {"code":"bookable_slot_occupancy","numerator":50,"denominator":100,"source":"manual","quality":"declared"},
    {"code":"appointment_attendance","numerator":50,"denominator":100,"source":"manual","quality":"declared"},
    {"code":"worked_opportunity_recovery","numerator":50,"denominator":100,"source":"manual","quality":"declared"},
    {"code":"administrative_return","numerator":50,"denominator":100,"source":"manual","quality":"declared"},
    {"code":"required_data_quality","numerator":50,"denominator":100,"source":"manual","quality":"declared"}
  ]'::jsonb,
  'phase2-incomplete-create', 'phase2-incomplete-create'
);

update phase2_ids
set incomplete_score_id = public.submit_radar_assessment(
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  incomplete_assessment_id,
  'phase2-incomplete-submit', 'phase2-incomplete-submit'
);

select results_eq(
  $$ select status::text, score_value from public.althion_scores where id = (select incomplete_score_id from phase2_ids) $$,
  $$ values ('insufficient_data'::text, null::numeric) $$,
  'missing mandatory dimension produces insufficient data without a numeric score'
);

select results_eq(
  $$ select count(*) from public.audit_logs where action in ('radar.assessment.created', 'radar.assessment.submitted') and request_id like 'phase2-test-%' $$,
  array[2::bigint],
  'successful create and submit commands are audited once'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.althion_scores where organization_id = '10000000-0000-4000-8000-000000000001' $$,
  array[0::bigint],
  'viewer from another tenant cannot enumerate scores'
);

select throws_ok(
  $$ select public.create_radar_assessment(
    '10000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002', null,
    '2026-06-01', '2026-06-30',
    '[{"code":"first_response_within_sla","numerator":1,"denominator":1,"source":"manual","quality":"declared"}]'::jsonb,
    'phase2-viewer-create-1', 'phase2-viewer-create'
  ) $$,
  '42501',
  'Not authorized to write Radar assessments',
  'viewer cannot create Radar assessments'
);

reset role;

select throws_ok(
  $$ insert into public.radar_assessments (
    organization_id, clinic_id, period_start, period_end, created_by
  ) values (
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    '2026-06-01', '2026-06-30',
    (select id from public.profiles where auth_user_id = '80000000-0000-4000-8000-000000000001')
  ) $$,
  '23503',
  'insert or update on table "radar_assessments" violates foreign key constraint "radar_assessments_organization_id_clinic_id_fkey"',
  'composite foreign key rejects cross-tenant Radar assessment'
);

select results_eq(
  $$ select count(*) from public.audit_logs where resource_id = (select score_id from phase2_ids) and metadata_redacted ? 'score_status' $$,
  array[1::bigint],
  'score audit stores sanitized status metadata without raw metric payloads'
);

select lives_ok(
  $$ update public.althion_score_formulas
     set status = 'published', published_at = now()
     where id = '61000000-0000-4000-8000-000000000001' $$,
  'complete provisional formula can be published after approval'
);

select throws_ok(
  $$ update public.althion_score_formulas
     set minimum_coverage = 70
     where id = '61000000-0000-4000-8000-000000000001' $$,
  '55000',
  'Published Althion Score formulas are immutable',
  'published formula cannot change historical calculations'
);

select * from finish();
rollback;
