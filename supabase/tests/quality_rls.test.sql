begin;

create extension if not exists pgtap with schema extensions;
select plan(12);

-- 1. Check feature flag default
select results_eq(
  $$ select default_enabled from public.feature_flags where key = 'quality.engine.v1' $$,
  array[false],
  'quality feature flag is deny-by-default'
);

-- Insert dummy rubric for testing
insert into public.quality_rubrics (version, title, description, criteria, is_active, created_by_profile_id)
values (
  '1.0.0-provisional',
  'Rubrica de Teste',
  'Rubrica para testes do pgTAP',
  '[{"id":"response_time","name":"Tempo","description":"Tempo","maxScore":5},{"id":"tone_empathy","name":"Tom","description":"Tom","maxScore":5}]'::jsonb,
  true,
  (select id from public.profiles where auth_user_id = '80000000-0000-4000-8000-000000000001')
);

create temporary table quality_ids (
  evaluation_id uuid,
  flag_id uuid
);
grant select, insert, update on quality_ids to authenticated;
insert into quality_ids default values;

-- Set session context as Specialist (user 4)
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

-- 2. Specialist creates evaluation
select lives_ok(
  $$ select public.create_quality_evaluation(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'conversation-001',
    '1.0.0-provisional',
    '{"response_time": 4, "tone_empathy": 5}'::jsonb,
    'Bom atendimento operacional',
    'idempotency-eval-001',
    'request-eval-001'
  ) $$,
  'specialist can create quality evaluation'
);

update quality_ids set evaluation_id = (
  select id from public.quality_evaluations
  where conversation_id = 'conversation-001'
);

-- 3. Check total score calculation
select results_eq(
  $$ select total_score from public.quality_evaluations where id = (select evaluation_id from quality_ids) $$,
  array[90.0],
  'total score calculates correctly (4+5=9/10 = 90.0)'
);

-- 4. Specialist creates clinical flag
select lives_ok(
  $$ select public.flag_clinical_conversation(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'conversation-002',
    'Paciente com dor de cabeça severa pedindo remédio',
    'idempotency-flag-001',
    'request-flag-001'
  ) $$,
  'specialist can flag clinical conversation'
);

update quality_ids set flag_id = (
  select id from public.quality_clinical_flags
  where conversation_id = 'conversation-002'
);

-- 5. Specialist can view evaluations
select results_eq(
  $$ select conversation_id from public.quality_evaluations where id = (select evaluation_id from quality_ids) $$,
  array['conversation-001'],
  'specialist can select quality evaluations'
);

-- 6. Specialist can view clinical flags
select results_eq(
  $$ select conversation_id from public.quality_clinical_flags where id = (select flag_id from quality_ids) $$,
  array['conversation-002'],
  'specialist can select clinical flags'
);

-- Set session context as Doctor A (user 7)
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000007","role":"authenticated"}',
  true
);

-- 7. Doctor A can resolve clinical flag
select lives_ok(
  $$ select public.resolve_clinical_flag(
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    (select flag_id from quality_ids),
    'Contato clínico feito, paciente orientado a procurar pronto socorro.',
    'idempotency-resolve-001',
    'request-resolve-001'
  ) $$,
  'doctor can resolve clinical flag'
);

-- 8. Doctor can view clinical flags
select results_eq(
  $$ select status::text from public.quality_clinical_flags where id = (select flag_id from quality_ids) $$,
  array['resolved'],
  'doctor can read and verify resolved flag status'
);

-- Set session context as Manager A (user 2)
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

-- 9. Manager can read evaluations
select results_eq(
  $$ select conversation_id from public.quality_evaluations where id = (select evaluation_id from quality_ids) $$,
  array['conversation-001'],
  'manager can read quality evaluations'
);

-- 10. Manager cannot read clinical flags (privacy guardrail)
select is_empty(
  $$ select 1 from public.quality_clinical_flags where id = (select flag_id from quality_ids) $$,
  'manager cannot read clinical flags containing health data'
);

-- Set session context as Viewer B (user 3, Org B)
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);

-- 11. Viewer B from Org B cannot read Org A's evaluations
select is_empty(
  $$ select 1 from public.quality_evaluations where id = (select evaluation_id from quality_ids) $$,
  'tenant isolation: user from Org B cannot read Org A evaluations'
);

-- 12. Viewer B from Org B cannot read Org A's clinical flags
select is_empty(
  $$ select 1 from public.quality_clinical_flags where id = (select flag_id from quality_ids) $$,
  'tenant isolation: user from Org B cannot read Org A clinical flags'
);

rollback;
