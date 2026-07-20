create type public.radar_assessment_status as enum ('draft', 'submitted');
create type public.radar_metric_source as enum ('manual');
create type public.radar_metric_quality as enum ('declared', 'verified');
create type public.score_formula_status as enum ('draft', 'published', 'retired');
create type public.score_result_status as enum ('calculated', 'insufficient_data');
create type public.score_component_status as enum ('calculated', 'insufficient_data');
create type public.recommendation_priority as enum ('high', 'medium', 'low');
create type public.score_dimension as enum (
  'speed',
  'conversion',
  'continuity',
  'occupancy',
  'attendance',
  'recovery',
  'retention',
  'data_intelligence'
);
create type public.radar_metric_code as enum (
  'first_response_within_sla',
  'lead_to_appointment',
  'follow_up_within_policy',
  'bookable_slot_occupancy',
  'appointment_attendance',
  'worked_opportunity_recovery',
  'administrative_return',
  'required_data_quality'
);

create table public.radar_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  unit_id uuid,
  period_start date not null,
  period_end date not null,
  questionnaire_version text not null default '1.0.0',
  status public.radar_assessment_status not null default 'draft',
  created_by uuid not null references public.profiles(id) on delete restrict,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  foreign key (organization_id, clinic_id, unit_id)
    references public.units(organization_id, clinic_id, id) on delete restrict,
  check (period_end >= period_start),
  check ((period_end - period_start + 1) between 7 and 92),
  check (unit_id is null or clinic_id is not null),
  check ((status = 'submitted') = (submitted_at is not null)),
  unique (organization_id, id),
  unique (organization_id, clinic_id, id)
);

create table public.radar_metric_inputs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  assessment_id uuid not null,
  metric_code public.radar_metric_code not null,
  numerator bigint not null check (numerator >= 0),
  denominator bigint not null check (denominator >= 0),
  source public.radar_metric_source not null default 'manual',
  quality public.radar_metric_quality not null default 'declared',
  observation text check (observation is null or char_length(observation) <= 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id, assessment_id)
    references public.radar_assessments(organization_id, clinic_id, id) on delete cascade,
  check (numerator <= denominator),
  unique (organization_id, assessment_id, metric_code),
  unique (organization_id, id)
);

create table public.althion_score_formulas (
  id uuid primary key default gen_random_uuid(),
  version text not null unique check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+(?:-[a-z0-9.-]+)?$'),
  status public.score_formula_status not null default 'draft',
  minimum_coverage numeric(5, 2) not null check (minimum_coverage between 0 and 100),
  mandatory_dimensions public.score_dimension[] not null,
  definition_hash text not null check (char_length(definition_hash) = 64),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'draft' and published_at is null)
    or (status in ('published', 'retired') and published_at is not null)
  )
);

create table public.althion_score_formula_components (
  id uuid primary key default gen_random_uuid(),
  formula_id uuid not null references public.althion_score_formulas(id) on delete restrict,
  metric_code public.radar_metric_code not null,
  dimension public.score_dimension not null,
  label text not null check (char_length(label) between 3 and 180),
  weight numeric(5, 2) not null check (weight > 0 and weight <= 100),
  transformation jsonb not null check (jsonb_typeof(transformation) = 'object'),
  created_at timestamptz not null default now(),
  unique (formula_id, metric_code),
  unique (formula_id, dimension)
);

create table public.althion_scores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  assessment_id uuid not null,
  formula_id uuid not null references public.althion_score_formulas(id) on delete restrict,
  status public.score_result_status not null,
  score_value numeric(5, 2),
  coverage numeric(5, 2) not null check (coverage between 0 and 100),
  input_hash text not null check (char_length(input_hash) = 64),
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id, assessment_id)
    references public.radar_assessments(organization_id, clinic_id, id) on delete restrict,
  check (
    (status = 'calculated' and score_value between 0 and 100)
    or (status = 'insufficient_data' and score_value is null)
  ),
  unique (organization_id, id),
  unique (organization_id, assessment_id, formula_id, input_hash)
);

create table public.althion_score_components (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  score_id uuid not null,
  metric_code public.radar_metric_code not null,
  dimension public.score_dimension not null,
  status public.score_component_status not null,
  score_value numeric(5, 2),
  weight numeric(5, 2) not null check (weight > 0 and weight <= 100),
  contribution numeric(5, 2),
  explanation jsonb not null check (jsonb_typeof(explanation) = 'object'),
  created_at timestamptz not null default now(),
  foreign key (organization_id, score_id)
    references public.althion_scores(organization_id, id) on delete restrict,
  check (
    (status = 'calculated' and score_value between 0 and 100 and contribution is not null)
    or (status = 'insufficient_data' and score_value is null and contribution is null)
  ),
  unique (organization_id, score_id, dimension),
  unique (organization_id, id)
);

create table public.althion_score_evidence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  score_id uuid not null,
  component_id uuid not null,
  metric_input_id uuid,
  metric_code public.radar_metric_code not null,
  numerator bigint,
  denominator bigint,
  normalized_value numeric(5, 2),
  source public.radar_metric_source,
  quality public.radar_metric_quality,
  reason_code text check (
    reason_code is null
    or reason_code in ('MISSING_METRIC', 'ZERO_DENOMINATOR', 'NUMERATOR_EXCEEDS_DENOMINATOR')
  ),
  transformation jsonb not null check (jsonb_typeof(transformation) = 'object'),
  created_at timestamptz not null default now(),
  foreign key (organization_id, score_id)
    references public.althion_scores(organization_id, id) on delete restrict,
  foreign key (organization_id, component_id)
    references public.althion_score_components(organization_id, id) on delete restrict,
  foreign key (organization_id, metric_input_id)
    references public.radar_metric_inputs(organization_id, id) on delete restrict,
  unique (organization_id, score_id, metric_code)
);

create table public.radar_recommendations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  assessment_id uuid not null,
  score_id uuid not null,
  rule_code text not null check (rule_code ~ '^[a-z0-9-]+$'),
  rule_version text not null,
  dimension public.score_dimension,
  evidence_metric_code public.radar_metric_code,
  priority public.recommendation_priority not null,
  title text not null check (char_length(title) between 3 and 180),
  rationale text not null check (char_length(rationale) between 3 and 600),
  created_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id, assessment_id)
    references public.radar_assessments(organization_id, clinic_id, id) on delete restrict,
  foreign key (organization_id, score_id)
    references public.althion_scores(organization_id, id) on delete restrict,
  unique (organization_id, score_id, rule_code)
);

create index radar_assessments_clinic_period_idx
  on public.radar_assessments(organization_id, clinic_id, period_end desc)
  where deleted_at is null;
create index radar_metric_inputs_assessment_idx
  on public.radar_metric_inputs(organization_id, assessment_id);
create index althion_scores_clinic_time_idx
  on public.althion_scores(organization_id, clinic_id, calculated_at desc);
create index althion_score_components_score_idx
  on public.althion_score_components(organization_id, score_id);
create index althion_score_evidence_score_idx
  on public.althion_score_evidence(organization_id, score_id);
create index radar_recommendations_score_priority_idx
  on public.radar_recommendations(organization_id, score_id, priority);

create trigger radar_assessments_set_updated_at
before update on public.radar_assessments
for each row execute function public.set_updated_at();

create trigger radar_metric_inputs_set_updated_at
before update on public.radar_metric_inputs
for each row execute function public.set_updated_at();

create trigger althion_score_formulas_set_updated_at
before update on public.althion_score_formulas
for each row execute function public.set_updated_at();

create or replace function app_private.can_read_radar(
  target_organization_id uuid,
  target_clinic_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.is_platform_admin()
    or (
      app_private.has_org_role(
        target_organization_id,
        array['organization_owner', 'clinic_manager', 'doctor', 'viewer']::public.membership_role[]
      )
      and app_private.can_access_clinic(target_organization_id, target_clinic_id)
    )
    or (
      app_private.has_active_assignment(target_organization_id)
      and app_private.can_access_clinic(target_organization_id, target_clinic_id)
    )
$$;

create or replace function app_private.can_write_radar(
  target_organization_id uuid,
  target_clinic_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.is_platform_admin()
    or (
      app_private.has_org_role(
        target_organization_id,
        array['organization_owner', 'clinic_manager']::public.membership_role[]
      )
      and app_private.can_access_clinic(target_organization_id, target_clinic_id)
    )
    or (
      app_private.has_active_assignment(target_organization_id)
      and app_private.can_access_clinic(target_organization_id, target_clinic_id)
    )
$$;

create or replace function app_private.validate_radar_metrics(target_metrics jsonb)
returns void
language plpgsql
immutable
set search_path = ''
as $$
declare
  metric jsonb;
begin
  if jsonb_typeof(target_metrics) <> 'array'
    or jsonb_array_length(target_metrics) < 1
    or jsonb_array_length(target_metrics) > 8 then
    raise exception using errcode = '22023', message = 'Radar metrics must contain between 1 and 8 items';
  end if;

  if (
    select count(distinct value->>'code') <> count(*)
    from jsonb_array_elements(target_metrics)
  ) then
    raise exception using errcode = '22023', message = 'Radar metric codes must be unique';
  end if;

  for metric in select value from jsonb_array_elements(target_metrics)
  loop
    if jsonb_typeof(metric) <> 'object'
      or (metric->>'code') is null
      or (metric->>'quality') is null
      or jsonb_typeof(metric->'numerator') <> 'number'
      or jsonb_typeof(metric->'denominator') <> 'number'
      or (metric->>'source') is distinct from 'manual'
      or (metric->>'quality') not in ('declared', 'verified')
      or (metric->>'code') not in (
        'first_response_within_sla', 'lead_to_appointment', 'follow_up_within_policy',
        'bookable_slot_occupancy', 'appointment_attendance', 'worked_opportunity_recovery',
        'administrative_return', 'required_data_quality'
      )
      or (metric->>'numerator')::numeric < 0
      or (metric->>'denominator')::numeric < 0
      or (metric->>'numerator')::numeric > 1000000000
      or (metric->>'denominator')::numeric > 1000000000
      or (metric->>'numerator')::numeric > (metric->>'denominator')::numeric
      or (metric->>'numerator')::numeric <> trunc((metric->>'numerator')::numeric)
      or (metric->>'denominator')::numeric <> trunc((metric->>'denominator')::numeric)
      or (
        metric ? 'observation'
        and jsonb_typeof(metric->'observation') not in ('string', 'null')
      )
      or coalesce(char_length(metric->>'observation'), 0) > 280 then
      raise exception using errcode = '22023', message = 'Invalid Radar metric payload';
    end if;
  end loop;
end
$$;

create or replace function app_private.reject_submitted_assessment_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'submitted' then
    raise exception using errcode = '55000', message = 'Submitted Radar assessments are immutable';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end
$$;

create trigger radar_assessments_immutable_after_submit
before update or delete on public.radar_assessments
for each row execute function app_private.reject_submitted_assessment_mutation();

create or replace function app_private.reject_submitted_metric_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_assessment_id uuid;
  target_organization_id uuid;
begin
  if tg_op = 'DELETE' then
    target_assessment_id := old.assessment_id;
    target_organization_id := old.organization_id;
  else
    target_assessment_id := new.assessment_id;
    target_organization_id := new.organization_id;
  end if;

  if exists (
    select 1 from public.radar_assessments
    where id = target_assessment_id
      and organization_id = target_organization_id
      and status = 'submitted'
  ) then
    raise exception using errcode = '55000', message = 'Submitted Radar inputs are immutable';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end
$$;

create trigger radar_metric_inputs_immutable_after_submit
before insert or update or delete on public.radar_metric_inputs
for each row execute function app_private.reject_submitted_metric_mutation();

create or replace function app_private.reject_score_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using errcode = '55000', message = 'Althion Score snapshots are immutable';
end
$$;

create trigger althion_scores_immutable
before update or delete on public.althion_scores
for each row execute function app_private.reject_score_mutation();

create trigger althion_score_components_immutable
before update or delete on public.althion_score_components
for each row execute function app_private.reject_score_mutation();

create trigger althion_score_evidence_immutable
before update or delete on public.althion_score_evidence
for each row execute function app_private.reject_score_mutation();

create trigger radar_recommendations_immutable
before update or delete on public.radar_recommendations
for each row execute function app_private.reject_score_mutation();

create or replace function app_private.guard_score_formula_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  total_weight numeric;
  component_count integer;
begin
  if old.status <> 'draft' then
    raise exception using errcode = '55000', message = 'Published Althion Score formulas are immutable';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  if new.status = 'published' then
    select coalesce(sum(weight), 0), count(*)
    into total_weight, component_count
    from public.althion_score_formula_components
    where formula_id = old.id;
    if total_weight <> 100 or component_count <> 8 then
      raise exception using errcode = '23514', message = 'Published Althion Score formula must contain eight components totaling 100';
    end if;
  end if;
  return new;
end
$$;

create trigger althion_score_formulas_guard
before update or delete on public.althion_score_formulas
for each row execute function app_private.guard_score_formula_mutation();

create or replace function app_private.guard_score_formula_component_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_formula_id uuid;
begin
  target_formula_id := case when tg_op = 'DELETE' then old.formula_id else new.formula_id end;
  if exists (
    select 1 from public.althion_score_formulas
    where id = target_formula_id and status <> 'draft'
  ) then
    raise exception using errcode = '55000', message = 'Published Althion Score formula components are immutable';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end
$$;

create trigger althion_score_formula_components_guard
before insert or update or delete on public.althion_score_formula_components
for each row execute function app_private.guard_score_formula_component_mutation();

insert into public.althion_score_formulas (
  id, version, status, minimum_coverage, mandatory_dimensions, definition_hash
)
values (
  '61000000-0000-4000-8000-000000000001',
  '1.0.0-provisional',
  'draft',
  75,
  array['speed', 'conversion', 'continuity', 'occupancy', 'attendance']::public.score_dimension[],
  encode(extensions.digest(convert_to('althion-score:1.0.0-provisional:15,20,15,15,15,10,5,5:coverage=75', 'UTF8'), 'sha256'), 'hex')
);

insert into public.althion_score_formula_components (
  id, formula_id, metric_code, dimension, label, weight, transformation
)
values
  ('62000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000001', 'first_response_within_sla', 'speed', 'Primeiras respostas dentro do SLA', 15, '{"type":"identity_ratio","provisional":true}'),
  ('62000000-0000-4000-8000-000000000002', '61000000-0000-4000-8000-000000000001', 'lead_to_appointment', 'conversion', 'Leads elegíveis convertidos em agendamento', 20, '{"type":"identity_ratio","provisional":true}'),
  ('62000000-0000-4000-8000-000000000003', '61000000-0000-4000-8000-000000000001', 'follow_up_within_policy', 'continuity', 'Acompanhamentos dentro da política', 15, '{"type":"identity_ratio","provisional":true}'),
  ('62000000-0000-4000-8000-000000000004', '61000000-0000-4000-8000-000000000001', 'bookable_slot_occupancy', 'occupancy', 'Ocupação dos horários agendáveis', 15, '{"type":"identity_ratio","provisional":true}'),
  ('62000000-0000-4000-8000-000000000005', '61000000-0000-4000-8000-000000000001', 'appointment_attendance', 'attendance', 'Comparecimentos esperados realizados', 15, '{"type":"identity_ratio","provisional":true}'),
  ('62000000-0000-4000-8000-000000000006', '61000000-0000-4000-8000-000000000001', 'worked_opportunity_recovery', 'recovery', 'Oportunidades trabalhadas recuperadas', 10, '{"type":"identity_ratio","provisional":true}'),
  ('62000000-0000-4000-8000-000000000007', '61000000-0000-4000-8000-000000000001', 'administrative_return', 'retention', 'Retornos administrativos elegíveis realizados', 5, '{"type":"identity_ratio","provisional":true}'),
  ('62000000-0000-4000-8000-000000000008', '61000000-0000-4000-8000-000000000001', 'required_data_quality', 'data_intelligence', 'Dados administrativos requeridos disponíveis', 5, '{"type":"identity_ratio","provisional":true}');

create or replace function public.create_radar_assessment(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_unit_id uuid,
  target_period_start date,
  target_period_end date,
  target_metrics jsonb,
  idempotency_key text,
  request_id text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := app_private.current_profile_id();
  assessment_id uuid := gen_random_uuid();
  existing_resource_id uuid;
  existing_request_hash text;
  inserted_count integer;
  v_key_hash text := encode(extensions.digest(convert_to(idempotency_key, 'UTF8'), 'sha256'), 'hex');
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'organization_id', target_organization_id,
    'clinic_id', target_clinic_id,
    'unit_id', target_unit_id,
    'period_start', target_period_start,
    'period_end', target_period_end,
    'metrics', target_metrics
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if actor_id is null or not app_private.can_write_radar(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Not authorized to write Radar assessments';
  end if;
  if idempotency_key is null
    or char_length(idempotency_key) < 16
    or char_length(idempotency_key) > 200 then
    raise exception using errcode = '22023', message = 'Invalid idempotency key';
  end if;
  if target_period_end < target_period_start
    or (target_period_end - target_period_start + 1) not between 7 and 92 then
    raise exception using errcode = '22023', message = 'Radar period must contain between 7 and 92 days';
  end if;
  if not exists (
    select 1 from public.clinics
    where organization_id = target_organization_id
      and id = target_clinic_id
      and deleted_at is null
  ) or (
    target_unit_id is not null and not exists (
      select 1 from public.units
      where organization_id = target_organization_id
        and clinic_id = target_clinic_id
        and id = target_unit_id
        and deleted_at is null
    )
  ) then
    raise exception using errcode = '23503', message = 'Clinic or unit does not belong to organization';
  end if;

  perform app_private.validate_radar_metrics(target_metrics);

  insert into public.idempotency_records (
    organization_id, scope, key_hash, request_hash, status, expires_at
  ) values (
    target_organization_id,
    'radar.create',
    v_key_hash,
    v_request_hash,
    'processing',
    now() + interval '24 hours'
  ) on conflict (organization_id, scope, key_hash) do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count = 0 then
    select resource_id, request_hash into existing_resource_id, existing_request_hash
    from public.idempotency_records
    where organization_id = target_organization_id
      and scope = 'radar.create'
      and idempotency_records.key_hash = v_key_hash;
    if existing_request_hash is distinct from v_request_hash then
      raise exception using errcode = '23514', message = 'Idempotency key was reused with a different Radar command';
    end if;
    if existing_resource_id is not null then return existing_resource_id; end if;
    raise exception using errcode = '55P03', message = 'Radar create command is already processing';
  end if;

  insert into public.radar_assessments (
    id, organization_id, clinic_id, unit_id, period_start, period_end, created_by
  ) values (
    assessment_id, target_organization_id, target_clinic_id, target_unit_id,
    target_period_start, target_period_end, actor_id
  );

  insert into public.radar_metric_inputs (
    organization_id, clinic_id, assessment_id, metric_code, numerator, denominator,
    source, quality, observation
  )
  select
    target_organization_id,
    target_clinic_id,
    assessment_id,
    (metric->>'code')::public.radar_metric_code,
    (metric->>'numerator')::bigint,
    (metric->>'denominator')::bigint,
    (metric->>'source')::public.radar_metric_source,
    (metric->>'quality')::public.radar_metric_quality,
    nullif(trim(metric->>'observation'), '')
  from jsonb_array_elements(target_metrics) metric;

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, actor_id, 'user', 'radar.assessment.created',
    'radar_assessment', assessment_id, request_id, 'success',
    jsonb_build_object(
      'clinic_id', target_clinic_id,
      'period_start', target_period_start,
      'period_end', target_period_end,
      'metric_count', jsonb_array_length(target_metrics)
    )
  );

  update public.idempotency_records
  set status = 'completed', resource_id = assessment_id
  where organization_id = target_organization_id
    and scope = 'radar.create'
    and idempotency_records.key_hash = v_key_hash;

  return assessment_id;
end
$$;

create or replace function public.replace_radar_assessment(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_assessment_id uuid,
  target_unit_id uuid,
  target_period_start date,
  target_period_end date,
  target_metrics jsonb,
  request_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := app_private.current_profile_id();
  current_status public.radar_assessment_status;
begin
  if actor_id is null or not app_private.can_write_radar(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Not authorized to write Radar assessments';
  end if;
  perform app_private.validate_radar_metrics(target_metrics);

  select status into current_status
  from public.radar_assessments
  where organization_id = target_organization_id
    and clinic_id = target_clinic_id
    and id = target_assessment_id
    and deleted_at is null
  for update;

  if current_status is null then
    raise exception using errcode = 'P0002', message = 'Radar assessment not found';
  end if;
  if current_status <> 'draft' then
    raise exception using errcode = '55000', message = 'Submitted Radar assessments are immutable';
  end if;
  if target_period_end < target_period_start
    or (target_period_end - target_period_start + 1) not between 7 and 92 then
    raise exception using errcode = '22023', message = 'Radar period must contain between 7 and 92 days';
  end if;

  update public.radar_assessments
  set unit_id = target_unit_id,
      period_start = target_period_start,
      period_end = target_period_end
  where id = target_assessment_id;

  delete from public.radar_metric_inputs
  where organization_id = target_organization_id and assessment_id = target_assessment_id;

  insert into public.radar_metric_inputs (
    organization_id, clinic_id, assessment_id, metric_code, numerator, denominator,
    source, quality, observation
  )
  select
    target_organization_id,
    target_clinic_id,
    target_assessment_id,
    (metric->>'code')::public.radar_metric_code,
    (metric->>'numerator')::bigint,
    (metric->>'denominator')::bigint,
    (metric->>'source')::public.radar_metric_source,
    (metric->>'quality')::public.radar_metric_quality,
    nullif(trim(metric->>'observation'), '')
  from jsonb_array_elements(target_metrics) metric;

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, actor_id, 'user', 'radar.assessment.updated',
    'radar_assessment', target_assessment_id, request_id, 'success',
    jsonb_build_object('clinic_id', target_clinic_id, 'metric_count', jsonb_array_length(target_metrics))
  );
end
$$;

create or replace function public.submit_radar_assessment(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_assessment_id uuid,
  idempotency_key text,
  request_id text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := app_private.current_profile_id();
  assessment_status public.radar_assessment_status;
  formula_record public.althion_score_formulas%rowtype;
  v_score_id uuid := gen_random_uuid();
  existing_score_id uuid;
  covered_weight numeric(5, 2);
  covered_dimensions public.score_dimension[];
  result_status public.score_result_status;
  result_value numeric(5, 2);
  inputs_hash text;
  v_key_hash text := encode(extensions.digest(convert_to(idempotency_key, 'UTF8'), 'sha256'), 'hex');
  inserted_count integer;
begin
  if actor_id is null or not app_private.can_write_radar(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Not authorized to submit Radar assessments';
  end if;
  if idempotency_key is null
    or char_length(idempotency_key) < 16
    or char_length(idempotency_key) > 200 then
    raise exception using errcode = '22023', message = 'Invalid idempotency key';
  end if;

  select status into assessment_status
  from public.radar_assessments
  where organization_id = target_organization_id
    and clinic_id = target_clinic_id
    and id = target_assessment_id
    and deleted_at is null
  for update;

  if assessment_status is null then
    raise exception using errcode = 'P0002', message = 'Radar assessment not found';
  end if;

  select id into existing_score_id
  from public.althion_scores
  where organization_id = target_organization_id
    and assessment_id = target_assessment_id
  order by calculated_at desc
  limit 1;
  if existing_score_id is not null then return existing_score_id; end if;

  select * into formula_record
  from public.althion_score_formulas
  where version = '1.0.0-provisional' and status = 'draft';
  if formula_record.id is null then
    raise exception using errcode = '55000', message = 'Provisional Althion Score formula is not available';
  end if;

  insert into public.idempotency_records (
    organization_id, scope, key_hash, request_hash, status, expires_at
  ) values (
    target_organization_id,
    'radar.submit',
    v_key_hash,
    encode(extensions.digest(convert_to(target_assessment_id::text, 'UTF8'), 'sha256'), 'hex'),
    'processing',
    now() + interval '24 hours'
  ) on conflict (organization_id, scope, key_hash) do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count = 0 then
    select resource_id into existing_score_id
    from public.idempotency_records
    where organization_id = target_organization_id
      and scope = 'radar.submit'
      and idempotency_records.key_hash = v_key_hash;
    if existing_score_id is not null then return existing_score_id; end if;
    raise exception using errcode = '55P03', message = 'Radar submit command is already processing';
  end if;

  select
    coalesce(sum(component.weight) filter (
      where input.id is not null and input.denominator > 0 and input.numerator <= input.denominator
    ), 0),
    coalesce(
      array_agg(component.dimension) filter (
        where input.id is not null and input.denominator > 0 and input.numerator <= input.denominator
      ),
      array[]::public.score_dimension[]
    )
  into covered_weight, covered_dimensions
  from public.althion_score_formula_components component
  left join public.radar_metric_inputs input
    on input.organization_id = target_organization_id
    and input.assessment_id = target_assessment_id
    and input.metric_code = component.metric_code
  where component.formula_id = formula_record.id;

  result_status := case
    when covered_weight >= formula_record.minimum_coverage
      and formula_record.mandatory_dimensions <@ covered_dimensions
    then 'calculated'::public.score_result_status
    else 'insufficient_data'::public.score_result_status
  end;

  if result_status = 'calculated' then
    select round(sum(
      round((input.numerator::numeric / input.denominator::numeric) * 100, 2)
      * component.weight / 100
    ), 0)
    into result_value
    from public.althion_score_formula_components component
    join public.radar_metric_inputs input
      on input.organization_id = target_organization_id
      and input.assessment_id = target_assessment_id
      and input.metric_code = component.metric_code
      and input.denominator > 0
      and input.numerator <= input.denominator
    where component.formula_id = formula_record.id;
  else
    result_value := null;
  end if;

  select encode(extensions.digest(convert_to(coalesce(string_agg(
    format('%s:%s:%s:%s:%s', metric_code, numerator, denominator, source, quality),
    '|' order by metric_code
  ), ''), 'UTF8'), 'sha256'), 'hex')
  into inputs_hash
  from public.radar_metric_inputs
  where organization_id = target_organization_id
    and assessment_id = target_assessment_id;

  update public.radar_assessments
  set status = 'submitted', submitted_at = now()
  where id = target_assessment_id;

  insert into public.althion_scores (
    id, organization_id, clinic_id, assessment_id, formula_id,
    status, score_value, coverage, input_hash
  ) values (
    v_score_id, target_organization_id, target_clinic_id, target_assessment_id,
    formula_record.id, result_status, result_value, covered_weight, inputs_hash
  );

  insert into public.althion_score_components (
    organization_id, score_id, metric_code, dimension, status,
    score_value, weight, contribution, explanation
  )
  select
    target_organization_id,
    v_score_id,
    component.metric_code,
    component.dimension,
    case when input.id is not null and input.denominator > 0 and input.numerator <= input.denominator
      then 'calculated'::public.score_component_status
      else 'insufficient_data'::public.score_component_status
    end,
    case when input.id is not null and input.denominator > 0 and input.numerator <= input.denominator
      then round((input.numerator::numeric / input.denominator::numeric) * 100, 2)
      else null
    end,
    component.weight,
    case when input.id is not null and input.denominator > 0 and input.numerator <= input.denominator
      then round((input.numerator::numeric / input.denominator::numeric) * 100, 2)
        * component.weight / 100
      else null
    end,
    jsonb_build_object(
      'label', component.label,
      'formula_version', formula_record.version,
      'formula_status', formula_record.status,
      'transformation', component.transformation
    )
  from public.althion_score_formula_components component
  left join public.radar_metric_inputs input
    on input.organization_id = target_organization_id
    and input.assessment_id = target_assessment_id
    and input.metric_code = component.metric_code
  where component.formula_id = formula_record.id;

  insert into public.althion_score_evidence (
    organization_id, score_id, component_id, metric_input_id, metric_code,
    numerator, denominator, normalized_value, source, quality, reason_code, transformation
  )
  select
    target_organization_id,
    v_score_id,
    score_component.id,
    input.id,
    formula_component.metric_code,
    input.numerator,
    input.denominator,
    score_component.score_value,
    input.source,
    input.quality,
    case
      when input.id is null then 'MISSING_METRIC'
      when input.denominator = 0 then 'ZERO_DENOMINATOR'
      when input.numerator > input.denominator then 'NUMERATOR_EXCEEDS_DENOMINATOR'
      else null
    end,
    formula_component.transformation
  from public.althion_score_formula_components formula_component
  join public.althion_score_components score_component
    on score_component.organization_id = target_organization_id
    and score_component.score_id = v_score_id
    and score_component.metric_code = formula_component.metric_code
  left join public.radar_metric_inputs input
    on input.organization_id = target_organization_id
    and input.assessment_id = target_assessment_id
    and input.metric_code = formula_component.metric_code
  where formula_component.formula_id = formula_record.id;

  insert into public.radar_recommendations (
    organization_id, clinic_id, assessment_id, score_id, rule_code, rule_version,
    dimension, evidence_metric_code, priority, title, rationale
  )
  select
    target_organization_id,
    target_clinic_id,
    target_assessment_id,
    v_score_id,
    case when score_component.status = 'insufficient_data'
      then 'collect-' || score_component.dimension::text
      else 'investigate-' || score_component.dimension::text
    end,
    '1.0.0-provisional',
    score_component.dimension,
    score_component.metric_code,
    case
      when score_component.status = 'insufficient_data' and score_component.weight >= 15 then 'high'::public.recommendation_priority
      when score_component.status = 'insufficient_data' then 'medium'::public.recommendation_priority
      when score_component.weight * (100 - score_component.score_value) / 100 >= 10 then 'high'::public.recommendation_priority
      when score_component.weight * (100 - score_component.score_value) / 100 >= 5 then 'medium'::public.recommendation_priority
      else 'low'::public.recommendation_priority
    end,
    case when score_component.status = 'insufficient_data'
      then 'Completar dados de ' || lower(formula_component.label)
      else 'Revisar ' || lower(formula_component.label)
    end,
    case when score_component.status = 'insufficient_data'
      then 'A dimensão não possui numerador e denominador consistentes para o período analisado.'
      else format(
        '%s de %s eventos elegíveis atenderam ao critério administrativo informado.',
        evidence.numerator,
        evidence.denominator
      )
    end
  from public.althion_score_components score_component
  join public.althion_score_formula_components formula_component
    on formula_component.formula_id = formula_record.id
    and formula_component.metric_code = score_component.metric_code
  join public.althion_score_evidence evidence
    on evidence.organization_id = target_organization_id
    and evidence.score_id = v_score_id
    and evidence.component_id = score_component.id
  where score_component.organization_id = target_organization_id
    and score_component.score_id = v_score_id
    and (score_component.status = 'insufficient_data' or score_component.score_value < 100);

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, actor_id, 'user', 'radar.assessment.submitted',
    'althion_score', v_score_id, request_id, 'success',
    jsonb_build_object(
      'assessment_id', target_assessment_id,
      'clinic_id', target_clinic_id,
      'formula_version', formula_record.version,
      'formula_status', formula_record.status,
      'coverage', covered_weight,
      'score_status', result_status
    )
  );

  update public.idempotency_records
  set status = 'completed', resource_id = v_score_id
  where organization_id = target_organization_id
    and scope = 'radar.submit'
    and idempotency_records.key_hash = v_key_hash;

  return v_score_id;
end
$$;

create or replace function public.record_radar_export(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_assessment_id uuid,
  request_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := app_private.current_profile_id();
begin
  if actor_id is null or not app_private.can_read_radar(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Not authorized to export Radar assessments';
  end if;
  if not exists (
    select 1 from public.radar_assessments
    where organization_id = target_organization_id
      and clinic_id = target_clinic_id
      and id = target_assessment_id
      and deleted_at is null
  ) then
    raise exception using errcode = 'P0002', message = 'Radar assessment not found';
  end if;

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, actor_id, 'user', 'radar.assessment.exported',
    'radar_assessment', target_assessment_id, request_id, 'success',
    jsonb_build_object('clinic_id', target_clinic_id, 'format', 'csv')
  );
end
$$;

alter table public.radar_assessments enable row level security;
alter table public.radar_assessments force row level security;
alter table public.radar_metric_inputs enable row level security;
alter table public.radar_metric_inputs force row level security;
alter table public.althion_score_formulas enable row level security;
alter table public.althion_score_formulas force row level security;
alter table public.althion_score_formula_components enable row level security;
alter table public.althion_score_formula_components force row level security;
alter table public.althion_scores enable row level security;
alter table public.althion_scores force row level security;
alter table public.althion_score_components enable row level security;
alter table public.althion_score_components force row level security;
alter table public.althion_score_evidence enable row level security;
alter table public.althion_score_evidence force row level security;
alter table public.radar_recommendations enable row level security;
alter table public.radar_recommendations force row level security;

create policy radar_assessments_select on public.radar_assessments
  for select to authenticated
  using (
    deleted_at is null
    and (
      app_private.can_write_radar(organization_id, clinic_id)
      or (status = 'submitted' and app_private.can_read_radar(organization_id, clinic_id))
    )
  );

create policy radar_metric_inputs_select on public.radar_metric_inputs
  for select to authenticated
  using (
    exists (
      select 1 from public.radar_assessments assessment
      where assessment.organization_id = radar_metric_inputs.organization_id
        and assessment.clinic_id = radar_metric_inputs.clinic_id
        and assessment.id = radar_metric_inputs.assessment_id
        and (
          app_private.can_write_radar(assessment.organization_id, assessment.clinic_id)
          or (
            assessment.status = 'submitted'
            and app_private.can_read_radar(assessment.organization_id, assessment.clinic_id)
          )
        )
    )
  );

create policy althion_score_formulas_select on public.althion_score_formulas
  for select to authenticated using (true);

create policy althion_score_formula_components_select on public.althion_score_formula_components
  for select to authenticated using (true);

create policy althion_scores_select on public.althion_scores
  for select to authenticated
  using (app_private.can_read_radar(organization_id, clinic_id));

create policy althion_score_components_select on public.althion_score_components
  for select to authenticated
  using (
    exists (
      select 1 from public.althion_scores score
      where score.organization_id = althion_score_components.organization_id
        and score.id = althion_score_components.score_id
        and app_private.can_read_radar(score.organization_id, score.clinic_id)
    )
  );

create policy althion_score_evidence_select on public.althion_score_evidence
  for select to authenticated
  using (
    exists (
      select 1 from public.althion_scores score
      where score.organization_id = althion_score_evidence.organization_id
        and score.id = althion_score_evidence.score_id
        and app_private.can_read_radar(score.organization_id, score.clinic_id)
    )
  );

create policy radar_recommendations_select on public.radar_recommendations
  for select to authenticated
  using (app_private.can_read_radar(organization_id, clinic_id));

revoke all on all functions in schema app_private from public, anon, authenticated;
revoke all on public.radar_assessments from anon, authenticated;
revoke all on public.radar_metric_inputs from anon, authenticated;
revoke all on public.althion_score_formulas from anon, authenticated;
revoke all on public.althion_score_formula_components from anon, authenticated;
revoke all on public.althion_scores from anon, authenticated;
revoke all on public.althion_score_components from anon, authenticated;
revoke all on public.althion_score_evidence from anon, authenticated;
revoke all on public.radar_recommendations from anon, authenticated;

grant select on public.radar_assessments to authenticated;
grant select on public.radar_metric_inputs to authenticated;
grant select on public.althion_score_formulas to authenticated;
grant select on public.althion_score_formula_components to authenticated;
grant select on public.althion_scores to authenticated;
grant select on public.althion_score_components to authenticated;
grant select on public.althion_score_evidence to authenticated;
grant select on public.radar_recommendations to authenticated;

revoke all on function public.create_radar_assessment(uuid, uuid, uuid, date, date, jsonb, text, text)
  from public, anon, authenticated;
revoke all on function public.replace_radar_assessment(uuid, uuid, uuid, uuid, date, date, jsonb, text)
  from public, anon, authenticated;
revoke all on function public.submit_radar_assessment(uuid, uuid, uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.record_radar_export(uuid, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.create_radar_assessment(uuid, uuid, uuid, date, date, jsonb, text, text)
  to authenticated;
grant execute on function public.replace_radar_assessment(uuid, uuid, uuid, uuid, date, date, jsonb, text)
  to authenticated;
grant execute on function public.submit_radar_assessment(uuid, uuid, uuid, text, text)
  to authenticated;
grant execute on function public.record_radar_export(uuid, uuid, uuid, text)
  to authenticated;

insert into public.feature_flags (key, description, default_enabled)
values ('radar.score.v1', 'Habilita o Radar e o Althion Score v1 provisório.', false)
on conflict (key) do nothing;
