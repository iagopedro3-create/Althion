create type public.clinical_flag_status as enum ('pending', 'transferred', 'resolved');

-- 1. quality_rubrics table
create table public.quality_rubrics (
  version text primary key check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9_.-]+)?$'),
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 500),
  criteria jsonb not null check (jsonb_typeof(criteria) = 'array'),
  is_active boolean not null default false,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

-- 2. quality_evaluations table
create table public.quality_evaluations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  conversation_id text not null check (char_length(conversation_id) between 1 and 255),
  evaluator_id uuid not null references public.profiles(id) on delete restrict,
  rubric_version text not null references public.quality_rubrics(version) on delete restrict,
  scores jsonb not null check (jsonb_typeof(scores) = 'object'),
  total_score numeric not null check (total_score between 0.0 and 100.0),
  feedback text check (feedback is null or char_length(feedback) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  unique (organization_id, id),
  unique (organization_id, clinic_id, id),
  unique (organization_id, clinic_id, conversation_id, rubric_version)
);

-- 3. quality_clinical_flags table
create table public.quality_clinical_flags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  conversation_id text not null check (char_length(conversation_id) between 1 and 255),
  flagged_at timestamptz not null default now(),
  flagged_by_profile_id uuid references public.profiles(id) on delete restrict,
  flag_reason text not null check (char_length(flag_reason) between 1 and 1000),
  status public.clinical_flag_status not null default 'pending',
  resolved_at timestamptz,
  resolved_by_profile_id uuid references public.profiles(id) on delete restrict,
  handoff_notes text check (handoff_notes is null or char_length(handoff_notes) <= 1000),
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  check ((status = 'resolved') = (resolved_at is not null)),
  check ((status = 'resolved') = (resolved_by_profile_id is not null)),
  check ((status = 'resolved') = (handoff_notes is not null)),
  unique (organization_id, id),
  unique (organization_id, clinic_id, id)
);

-- 4. quality_evaluation_history table
create table public.quality_evaluation_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  evaluation_id uuid not null,
  rubric_version text not null,
  total_score numeric not null,
  changed_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  changed_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id, evaluation_id)
    references public.quality_evaluations(organization_id, clinic_id, id) on delete restrict,
  unique (organization_id, id)
);

-- 5. quality_clinical_flag_history table
create table public.quality_clinical_flag_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  flag_id uuid not null,
  from_status public.clinical_flag_status,
  to_status public.clinical_flag_status not null,
  changed_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  changed_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id, flag_id)
    references public.quality_clinical_flags(organization_id, clinic_id, id) on delete restrict,
  check (from_status is null or from_status <> to_status),
  unique (organization_id, id)
);

-- 6. Indexes
create index quality_rubrics_created_idx
  on public.quality_rubrics(created_at desc);
create index quality_evaluations_clinic_score_idx
  on public.quality_evaluations(organization_id, clinic_id, total_score desc);
create index quality_evaluations_conversation_idx
  on public.quality_evaluations(organization_id, clinic_id, conversation_id);
create index quality_clinical_flags_status_idx
  on public.quality_clinical_flags(organization_id, clinic_id, status, flagged_at desc);
create index quality_evaluation_history_idx
  on public.quality_evaluation_history(organization_id, clinic_id, evaluation_id, changed_at);
create index quality_clinical_flag_history_idx
  on public.quality_clinical_flag_history(organization_id, clinic_id, flag_id, changed_at);

-- 7. Triggers
create trigger quality_evaluations_set_updated_at
before update on public.quality_evaluations
for each row execute function public.set_updated_at();

create trigger quality_evaluations_history_append_only
before update or delete on public.quality_evaluation_history
for each row execute function app_private.reject_cockpit_history_mutation();

create trigger quality_clinical_flags_history_append_only
before update or delete on public.quality_clinical_flag_history
for each row execute function app_private.reject_cockpit_history_mutation();

-- 8. Helper Functions
create or replace function app_private.can_read_quality(
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
    or app_private.is_assigned_specialist(target_organization_id, target_clinic_id)
    or (
      app_private.can_access_clinic(target_organization_id, target_clinic_id)
      and app_private.has_org_role(
        target_organization_id,
        array['organization_owner', 'clinic_manager', 'doctor']::public.membership_role[]
      )
    )
$$;

create or replace function app_private.can_evaluate_quality(
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
    or app_private.is_assigned_specialist(target_organization_id, target_clinic_id)
$$;

create or replace function app_private.can_read_clinical_flags(
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
    or app_private.is_assigned_specialist(target_organization_id, target_clinic_id)
    or (
      app_private.can_access_clinic(target_organization_id, target_clinic_id)
      and app_private.has_org_role(
        target_organization_id,
        array['doctor']::public.membership_role[]
      )
    )
$$;

create or replace function app_private.can_flag_clinical_conversation(
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
    or app_private.is_assigned_specialist(target_organization_id, target_clinic_id)
    or (
      app_private.can_access_clinic(target_organization_id, target_clinic_id)
      and app_private.has_org_role(
        target_organization_id,
        array['organization_owner', 'clinic_manager', 'doctor', 'operator']::public.membership_role[]
      )
    )
$$;

-- 9. Row Level Security Enablement
alter table public.quality_rubrics enable row level security;
alter table public.quality_rubrics force row level security;
alter table public.quality_evaluations enable row level security;
alter table public.quality_evaluations force row level security;
alter table public.quality_clinical_flags enable row level security;
alter table public.quality_clinical_flags force row level security;
alter table public.quality_evaluation_history enable row level security;
alter table public.quality_evaluation_history force row level security;
alter table public.quality_clinical_flag_history enable row level security;
alter table public.quality_clinical_flag_history force row level security;

-- 10. RLS Policies
create policy quality_rubrics_select on public.quality_rubrics
for select to authenticated
using (true);

create policy quality_evaluations_select on public.quality_evaluations
for select to authenticated
using (app_private.can_read_quality(organization_id, clinic_id));

create policy quality_clinical_flags_select on public.quality_clinical_flags
for select to authenticated
using (app_private.can_read_clinical_flags(organization_id, clinic_id));

create policy quality_evaluation_history_select on public.quality_evaluation_history
for select to authenticated
using (app_private.can_read_quality(organization_id, clinic_id));

create policy quality_clinical_flag_history_select on public.quality_clinical_flag_history
for select to authenticated
using (app_private.can_read_clinical_flags(organization_id, clinic_id));

-- Grants
grant select on public.quality_rubrics to authenticated;
grant select on public.quality_evaluations to authenticated;
grant select on public.quality_clinical_flags to authenticated;
grant select on public.quality_evaluation_history to authenticated;
grant select on public.quality_clinical_flag_history to authenticated;

-- 11. RPC: create_quality_evaluation
create or replace function public.create_quality_evaluation(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_conversation_id text,
  target_rubric_version text,
  target_scores jsonb,
  target_feedback text,
  idempotency_key text,
  request_id text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := app_private.current_profile_id();
  v_evaluation_id uuid;
  v_existing_id uuid;
  v_criteria jsonb;
  v_criterion jsonb;
  v_crit_id text;
  v_crit_max integer;
  v_score integer;
  v_total_points_earned integer := 0;
  v_max_possible_points integer := 0;
  v_percentage numeric;
  v_scope text := 'quality.evaluation.' || target_clinic_id::text || '.' || target_conversation_id;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'conversation', target_conversation_id,
    'rubric_version', target_rubric_version,
    'scores', target_scores,
    'feedback', target_feedback
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_evaluate_quality(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Quality evaluation write denied';
  end if;
  if v_actor is null then
    raise exception using errcode = '42501', message = 'Active profile required';
  end if;
  if jsonb_typeof(target_scores) <> 'object' then
    raise exception using errcode = '22023', message = 'Invalid scores payload';
  end if;

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_request_hash
  );
  if v_existing_id is not null then return v_existing_id; end if;

  -- Load criteria from rubric
  select criteria into v_criteria
  from public.quality_rubrics
  where version = target_rubric_version;
  if not found then
    raise exception using errcode = 'P0002', message = 'Quality rubric version not found';
  end if;

  -- Validate scores against criteria and calculate total
  for v_criterion in select * from jsonb_array_elements(v_criteria)
  loop
    v_crit_id := v_criterion->>'id';
    v_crit_max := (v_criterion->>'maxScore')::integer;
    v_score := (target_scores->>v_crit_id)::integer;

    if v_score is null then
      raise exception using errcode = '22023', message = 'Missing score for criterion ' || v_crit_id;
    end if;

    if v_score < 0 or v_score > v_crit_max then
      raise exception using errcode = '23514', message = 'Invalid score value for criterion ' || v_crit_id;
    end if;

    v_total_points_earned := v_total_points_earned + v_score;
    v_max_possible_points := v_max_possible_points + v_crit_max;
  end loop;

  if v_max_possible_points = 0 then
    v_percentage := 0.0;
  else
    v_percentage := round((v_total_points_earned::numeric / v_max_possible_points::numeric) * 100.0, 2);
  end if;

  insert into public.quality_evaluations (
    organization_id, clinic_id, conversation_id, evaluator_id,
    rubric_version, scores, total_score, feedback
  ) values (
    target_organization_id, target_clinic_id, target_conversation_id, v_actor,
    target_rubric_version, target_scores, v_percentage, nullif(target_feedback, '')
  ) returning id into v_evaluation_id;

  insert into public.quality_evaluation_history (
    organization_id, clinic_id, evaluation_id, rubric_version, total_score, changed_by_profile_id
  ) values (
    target_organization_id, target_clinic_id, v_evaluation_id, target_rubric_version, v_percentage, v_actor
  );

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'quality.evaluation.created',
    'quality_evaluation', v_evaluation_id, request_id, 'success',
    jsonb_build_object(
      'clinic_id', target_clinic_id,
      'conversation_id', target_conversation_id,
      'total_score', v_percentage,
      'rubric_version', target_rubric_version
    )
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_evaluation_id
  );
  return v_evaluation_id;
end;
$$;

-- 12. RPC: flag_clinical_conversation
create or replace function public.flag_clinical_conversation(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_conversation_id text,
  target_flag_reason text,
  idempotency_key text,
  request_id text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := app_private.current_profile_id();
  v_flag_id uuid;
  v_existing_id uuid;
  v_scope text := 'quality.flag.' || target_clinic_id::text || '.' || target_conversation_id;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'conversation', target_conversation_id,
    'reason', target_flag_reason
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_flag_clinical_conversation(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Flag clinical conversation denied';
  end if;

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_request_hash
  );
  if v_existing_id is not null then return v_existing_id; end if;

  insert into public.quality_clinical_flags (
    organization_id, clinic_id, conversation_id, flagged_by_profile_id, flag_reason, status
  ) values (
    target_organization_id, target_clinic_id, target_conversation_id, v_actor, target_flag_reason, 'pending'
  ) returning id into v_flag_id;

  insert into public.quality_clinical_flag_history (
    organization_id, clinic_id, flag_id, from_status, to_status, changed_by_profile_id
  ) values (
    target_organization_id, target_clinic_id, v_flag_id, null, 'pending', v_actor
  );

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'quality.clinical_flag.created',
    'quality_clinical_flag', v_flag_id, request_id, 'success',
    jsonb_build_object('clinic_id', target_clinic_id, 'conversation_id', target_conversation_id)
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_flag_id
  );
  return v_flag_id;
end;
$$;

-- 13. RPC: resolve_clinical_flag
create or replace function public.resolve_clinical_flag(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_flag_id uuid,
  target_handoff_notes text,
  idempotency_key text,
  request_id text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := app_private.current_profile_id();
  v_current public.quality_clinical_flags%rowtype;
  v_existing_id uuid;
  v_scope text := 'quality.flag.resolve.' || target_flag_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'flag', target_flag_id,
    'notes', target_handoff_notes
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_read_clinical_flags(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Resolve clinical flag denied';
  end if;
  if v_actor is null then
    raise exception using errcode = '42501', message = 'Active profile required';
  end if;

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_request_hash
  );
  if v_existing_id is not null then return v_existing_id; end if;

  select * into v_current
  from public.quality_clinical_flags
  where organization_id = target_organization_id
    and clinic_id = target_clinic_id
    and id = target_flag_id
    for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Clinical flag not found';
  end if;
  if v_current.status = 'resolved' then
    raise exception using errcode = '23514', message = 'Clinical flag already resolved';
  end if;

  update public.quality_clinical_flags
  set status = 'resolved',
      resolved_at = now(),
      resolved_by_profile_id = v_actor,
      handoff_notes = target_handoff_notes
  where id = target_flag_id;

  insert into public.quality_clinical_flag_history (
    organization_id, clinic_id, flag_id, from_status, to_status, changed_by_profile_id
  ) values (
    target_organization_id, target_clinic_id, target_flag_id, v_current.status, 'resolved', v_actor
  );

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'quality.clinical_flag.resolved',
    'quality_clinical_flag', target_flag_id, request_id, 'success',
    jsonb_build_object('clinic_id', target_clinic_id, 'conversation_id', v_current.conversation_id)
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, target_flag_id
  );
  return target_flag_id;
end;
$$;

-- Revokes and Grants on functions
revoke all on function public.create_quality_evaluation(
  uuid, uuid, text, text, jsonb, text, text, text
) from public, anon;
revoke all on function public.flag_clinical_conversation(
  uuid, uuid, text, text, text, text
) from public, anon;
revoke all on function public.resolve_clinical_flag(
  uuid, uuid, uuid, text, text, text
) from public, anon;

grant execute on function public.create_quality_evaluation(
  uuid, uuid, text, text, jsonb, text, text, text
) to authenticated;
grant execute on function public.flag_clinical_conversation(
  uuid, uuid, text, text, text, text
) to authenticated;
grant execute on function public.resolve_clinical_flag(
  uuid, uuid, uuid, text, text, text
) to authenticated;

-- Default Feature Flag
insert into public.feature_flags (key, description, default_enabled)
values (
  'quality.engine.v1',
  'Habilita o modulo Quality Engine (avaliacao assistida e guardrail clinico) da Fase 7.',
  false
)
on conflict (key) do nothing;
