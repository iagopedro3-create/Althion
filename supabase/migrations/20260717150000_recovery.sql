create type public.recovery_rule_code as enum ('lead_no_response', 'attended_no_booking');
create type public.recovery_action_type as enum ('contact_lead', 'offer_booking');
create type public.recovery_opportunity_status as enum (
  'identified',
  'approved',
  'discarded',
  'expired'
);
create type public.recovery_action_status as enum ('recommended', 'approved', 'rejected', 'expired');
create type public.recovery_suppression_reason as enum (
  'opt_out',
  'complaint',
  'manual_review',
  'other'
);
create type public.recovery_consent_state as enum ('granted', 'denied');
create type public.recovery_simulation_status as enum ('completed', 'failed');

create table public.recovery_consents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  external_lead_ref text not null check (external_lead_ref ~ '^[A-Za-z0-9_.:-]{1,120}$'),
  state public.recovery_consent_state not null,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  unique (organization_id, clinic_id, external_lead_ref),
  unique (organization_id, id)
);

create table public.recovery_suppressions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  external_lead_ref text not null check (external_lead_ref ~ '^[A-Za-z0-9_.:-]{1,120}$'),
  reason public.recovery_suppression_reason not null,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  revoked_by_profile_id uuid references public.profiles(id) on delete restrict,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  check (revoked_at is null or revoked_at >= created_at),
  unique (organization_id, id),
  unique (organization_id, clinic_id, id)
);

create unique index recovery_suppressions_one_active_per_lead
  on public.recovery_suppressions(organization_id, clinic_id, external_lead_ref)
  where revoked_at is null;

create table public.recovery_simulations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  policy_version text not null check (char_length(policy_version) between 3 and 40),
  provider text not null default 'mock' check (provider = 'mock'),
  status public.recovery_simulation_status not null default 'completed',
  window_start timestamptz not null,
  window_end timestamptz not null,
  leads_evaluated integer not null check (leads_evaluated >= 0),
  opportunities_identified integer not null check (opportunities_identified >= 0),
  excluded_no_consent integer not null check (excluded_no_consent >= 0),
  excluded_suppressed integer not null check (excluded_suppressed >= 0),
  excluded_frequency integer not null check (excluded_frequency >= 0),
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  check (window_end > window_start),
  unique (organization_id, id),
  unique (organization_id, clinic_id, id)
);

create table public.recovery_opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  simulation_id uuid not null,
  rule_code public.recovery_rule_code not null,
  rule_version text not null check (char_length(rule_version) between 3 and 40),
  external_lead_ref text not null check (external_lead_ref ~ '^[A-Za-z0-9_.:-]{1,120}$'),
  lead_label text check (lead_label is null or char_length(lead_label) between 1 and 120),
  evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(evidence) = 'object'),
  status public.recovery_opportunity_status not null default 'identified',
  decided_by_profile_id uuid references public.profiles(id) on delete restrict,
  decided_at timestamptz,
  reason_code text check (reason_code is null or reason_code ~ '^[a-z][a-z0-9_]{2,63}$'),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  foreign key (organization_id, clinic_id, simulation_id)
    references public.recovery_simulations(organization_id, clinic_id, id) on delete restrict,
  check ((status in ('approved', 'discarded')) = (decided_at is not null)),
  unique (organization_id, clinic_id, simulation_id, rule_code, external_lead_ref),
  unique (organization_id, id),
  unique (organization_id, clinic_id, id)
);

create table public.recovery_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  opportunity_id uuid not null,
  action_type public.recovery_action_type not null,
  status public.recovery_action_status not null default 'recommended',
  decided_by_profile_id uuid references public.profiles(id) on delete restrict,
  decided_at timestamptz,
  reason_code text check (reason_code is null or reason_code ~ '^[a-z][a-z0-9_]{2,63}$'),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  foreign key (organization_id, clinic_id, opportunity_id)
    references public.recovery_opportunities(organization_id, clinic_id, id) on delete restrict,
  check ((status in ('approved', 'rejected')) = (decided_at is not null)),
  unique (organization_id, id),
  unique (organization_id, clinic_id, id)
);

create table public.recovery_opportunity_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  opportunity_id uuid not null,
  from_status public.recovery_opportunity_status,
  to_status public.recovery_opportunity_status not null,
  reason_code text check (reason_code is null or reason_code ~ '^[a-z][a-z0-9_]{2,63}$'),
  changed_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  changed_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id, opportunity_id)
    references public.recovery_opportunities(organization_id, clinic_id, id) on delete restrict,
  check (from_status is null or from_status <> to_status),
  unique (organization_id, id)
);

create table public.recovery_action_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  action_id uuid not null,
  from_status public.recovery_action_status,
  to_status public.recovery_action_status not null,
  reason_code text check (reason_code is null or reason_code ~ '^[a-z][a-z0-9_]{2,63}$'),
  changed_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  changed_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id, action_id)
    references public.recovery_actions(organization_id, clinic_id, id) on delete restrict,
  check (from_status is null or from_status <> to_status),
  unique (organization_id, id)
);

create index recovery_simulations_clinic_time_idx
  on public.recovery_simulations(organization_id, clinic_id, created_at desc);
create index recovery_opportunities_clinic_status_idx
  on public.recovery_opportunities(organization_id, clinic_id, status, created_at desc);
create index recovery_opportunities_lead_idx
  on public.recovery_opportunities(organization_id, clinic_id, external_lead_ref);
create index recovery_actions_clinic_status_idx
  on public.recovery_actions(organization_id, clinic_id, status, created_at desc);
create index recovery_actions_opportunity_idx
  on public.recovery_actions(organization_id, clinic_id, opportunity_id);
create index recovery_suppressions_clinic_idx
  on public.recovery_suppressions(organization_id, clinic_id, created_at desc);
create index recovery_opportunity_history_idx
  on public.recovery_opportunity_status_history(organization_id, clinic_id, opportunity_id, changed_at);
create index recovery_action_history_idx
  on public.recovery_action_status_history(organization_id, clinic_id, action_id, changed_at);

create trigger recovery_consents_set_updated_at
before update on public.recovery_consents
for each row execute function public.set_updated_at();

create trigger recovery_suppressions_set_updated_at
before update on public.recovery_suppressions
for each row execute function public.set_updated_at();

create trigger recovery_opportunities_set_updated_at
before update on public.recovery_opportunities
for each row execute function public.set_updated_at();

create trigger recovery_actions_set_updated_at
before update on public.recovery_actions
for each row execute function public.set_updated_at();

create trigger recovery_opportunity_history_append_only
before update or delete on public.recovery_opportunity_status_history
for each row execute function app_private.reject_cockpit_history_mutation();

create trigger recovery_action_history_append_only
before update or delete on public.recovery_action_status_history
for each row execute function app_private.reject_cockpit_history_mutation();

create or replace function app_private.can_read_recovery(
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
        array['organization_owner', 'clinic_manager']::public.membership_role[]
      )
    )
$$;

create or replace function app_private.can_simulate_recovery(
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

revoke all on all functions in schema app_private from public, anon, authenticated;

alter table public.recovery_consents enable row level security;
alter table public.recovery_consents force row level security;
alter table public.recovery_suppressions enable row level security;
alter table public.recovery_suppressions force row level security;
alter table public.recovery_simulations enable row level security;
alter table public.recovery_simulations force row level security;
alter table public.recovery_opportunities enable row level security;
alter table public.recovery_opportunities force row level security;
alter table public.recovery_actions enable row level security;
alter table public.recovery_actions force row level security;
alter table public.recovery_opportunity_status_history enable row level security;
alter table public.recovery_opportunity_status_history force row level security;
alter table public.recovery_action_status_history enable row level security;
alter table public.recovery_action_status_history force row level security;

create policy recovery_consents_select on public.recovery_consents
for select to authenticated
using (app_private.can_read_recovery(organization_id, clinic_id));

create policy recovery_suppressions_select on public.recovery_suppressions
for select to authenticated
using (app_private.can_read_recovery(organization_id, clinic_id));

create policy recovery_simulations_select on public.recovery_simulations
for select to authenticated
using (app_private.can_read_recovery(organization_id, clinic_id));

create policy recovery_opportunities_select on public.recovery_opportunities
for select to authenticated
using (app_private.can_read_recovery(organization_id, clinic_id));

create policy recovery_actions_select on public.recovery_actions
for select to authenticated
using (app_private.can_read_recovery(organization_id, clinic_id));

create policy recovery_opportunity_status_history_select on public.recovery_opportunity_status_history
for select to authenticated
using (app_private.can_read_recovery(organization_id, clinic_id));

create policy recovery_action_status_history_select on public.recovery_action_status_history
for select to authenticated
using (app_private.can_read_recovery(organization_id, clinic_id));

grant select on public.recovery_consents to authenticated;
grant select on public.recovery_suppressions to authenticated;
grant select on public.recovery_simulations to authenticated;
grant select on public.recovery_opportunities to authenticated;
grant select on public.recovery_actions to authenticated;
grant select on public.recovery_opportunity_status_history to authenticated;
grant select on public.recovery_action_status_history to authenticated;

create or replace function public.run_recovery_simulation(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_policy_version text,
  target_window_start timestamptz,
  target_window_end timestamptz,
  target_leads_evaluated integer,
  target_candidates jsonb,
  target_exclusions jsonb,
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
  v_simulation_id uuid;
  v_existing_id uuid;
  v_candidate jsonb;
  v_ref text;
  v_opportunity_id uuid;
  v_approved_7d integer;
  v_approved_30d integer;
  v_no_consent integer := 0;
  v_suppressed integer := 0;
  v_frequency integer := 0;
  v_scope text := 'recovery.simulation.' || target_clinic_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'clinic', target_clinic_id,
    'policy', target_policy_version,
    'window_start', target_window_start,
    'window_end', target_window_end,
    'candidates', target_candidates,
    'exclusions', target_exclusions
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_simulate_recovery(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Recovery simulation denied';
  end if;
  if v_actor is null then
    raise exception using errcode = '42501', message = 'Active profile required';
  end if;
  if jsonb_typeof(target_candidates) <> 'array' or jsonb_typeof(target_exclusions) <> 'array' then
    raise exception using errcode = '22023', message = 'Invalid simulation payload';
  end if;
  if target_leads_evaluated < 0
    or target_window_end <= target_window_start then
    raise exception using errcode = '22023', message = 'Invalid simulation window';
  end if;

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id,
    v_scope,
    idempotency_key,
    v_request_hash
  );
  if v_existing_id is not null then
    return v_existing_id;
  end if;

  select
    count(*) filter (where item->>'reason' = 'excluded_no_consent'),
    count(*) filter (where item->>'reason' = 'excluded_suppressed'),
    count(*) filter (where item->>'reason' = 'excluded_frequency')
  into v_no_consent, v_suppressed, v_frequency
  from jsonb_array_elements(target_exclusions) as item;

  insert into public.recovery_simulations (
    organization_id,
    clinic_id,
    policy_version,
    window_start,
    window_end,
    leads_evaluated,
    opportunities_identified,
    excluded_no_consent,
    excluded_suppressed,
    excluded_frequency,
    created_by_profile_id
  ) values (
    target_organization_id,
    target_clinic_id,
    target_policy_version,
    target_window_start,
    target_window_end,
    target_leads_evaluated,
    jsonb_array_length(target_candidates),
    v_no_consent,
    v_suppressed,
    v_frequency,
    v_actor
  ) returning id into v_simulation_id;

  for v_candidate in select * from jsonb_array_elements(target_candidates)
  loop
    v_ref := v_candidate->>'external_lead_ref';
    if v_ref is null or v_ref !~ '^[A-Za-z0-9_.:-]{1,120}$' then
      raise exception using errcode = '22023', message = 'Invalid candidate lead reference';
    end if;

    -- Defesa em profundidade: consentimento, supressão e frequência revalidados no banco.
    if not exists (
      select 1 from public.recovery_consents consent
      where consent.organization_id = target_organization_id
        and consent.clinic_id = target_clinic_id
        and consent.external_lead_ref = v_ref
        and consent.state = 'granted'
    ) then
      raise exception using errcode = '23514', message = 'Candidate without granted consent';
    end if;
    if exists (
      select 1 from public.recovery_suppressions suppression
      where suppression.organization_id = target_organization_id
        and suppression.clinic_id = target_clinic_id
        and suppression.external_lead_ref = v_ref
        and suppression.revoked_at is null
        and (suppression.expires_at is null or suppression.expires_at > now())
    ) then
      raise exception using errcode = '23514', message = 'Candidate is suppressed';
    end if;
    select
      count(*) filter (where action.decided_at > now() - interval '7 days'),
      count(*) filter (where action.decided_at > now() - interval '30 days')
    into v_approved_7d, v_approved_30d
    from public.recovery_actions action
    join public.recovery_opportunities opportunity
      on opportunity.organization_id = action.organization_id
      and opportunity.clinic_id = action.clinic_id
      and opportunity.id = action.opportunity_id
    where action.organization_id = target_organization_id
      and action.clinic_id = target_clinic_id
      and action.status = 'approved'
      and opportunity.external_lead_ref = v_ref;
    if v_approved_7d >= 1 or v_approved_30d >= 3 then
      raise exception using errcode = '23514', message = 'Candidate exceeds frequency policy';
    end if;

    insert into public.recovery_opportunities (
      organization_id,
      clinic_id,
      simulation_id,
      rule_code,
      rule_version,
      external_lead_ref,
      lead_label,
      evidence,
      expires_at
    ) values (
      target_organization_id,
      target_clinic_id,
      v_simulation_id,
      (v_candidate->>'rule_code')::public.recovery_rule_code,
      v_candidate->>'rule_version',
      v_ref,
      nullif(v_candidate->>'lead_label', ''),
      coalesce(v_candidate->'evidence', '{}'::jsonb),
      now() + interval '14 days'
    ) returning id into v_opportunity_id;

    insert into public.recovery_opportunity_status_history (
      organization_id, clinic_id, opportunity_id, from_status, to_status, changed_by_profile_id
    ) values (
      target_organization_id, target_clinic_id, v_opportunity_id, null, 'identified', v_actor
    );

    insert into public.recovery_actions (
      organization_id,
      clinic_id,
      opportunity_id,
      action_type,
      expires_at
    ) values (
      target_organization_id,
      target_clinic_id,
      v_opportunity_id,
      (v_candidate->>'action_type')::public.recovery_action_type,
      now() + interval '14 days'
    );
  end loop;

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'recovery.simulation.completed',
    'recovery_simulation', v_simulation_id, request_id, 'success',
    jsonb_build_object(
      'clinic_id', target_clinic_id,
      'policy_version', target_policy_version,
      'leads_evaluated', target_leads_evaluated,
      'opportunities_identified', jsonb_array_length(target_candidates),
      'excluded_no_consent', v_no_consent,
      'excluded_suppressed', v_suppressed,
      'excluded_frequency', v_frequency
    )
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_simulation_id
  );
  return v_simulation_id;
end;
$$;

create or replace function public.decide_recovery_opportunity(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_opportunity_id uuid,
  target_decision public.recovery_opportunity_status,
  target_reason_code text,
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
  v_current public.recovery_opportunities%rowtype;
  v_existing_id uuid;
  v_scope text := 'recovery.opportunity.decide.' || target_opportunity_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'opportunity', target_opportunity_id,
    'decision', target_decision,
    'reason', target_reason_code
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_read_recovery(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Recovery decision denied';
  end if;
  if target_decision not in ('approved', 'discarded') then
    raise exception using errcode = '22023', message = 'Invalid opportunity decision';
  end if;

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_request_hash
  );
  if v_existing_id is not null then return v_existing_id; end if;

  select * into v_current
  from public.recovery_opportunities
  where organization_id = target_organization_id
    and clinic_id = target_clinic_id
    and id = target_opportunity_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Recovery opportunity not found';
  end if;
  if v_current.status <> 'identified' then
    raise exception using errcode = '23514', message = 'Opportunity already decided';
  end if;
  if now() > v_current.expires_at then
    raise exception using errcode = '23514', message = 'Opportunity expired';
  end if;

  update public.recovery_opportunities
  set status = target_decision,
      decided_by_profile_id = v_actor,
      decided_at = now(),
      reason_code = target_reason_code
  where id = target_opportunity_id;

  insert into public.recovery_opportunity_status_history (
    organization_id, clinic_id, opportunity_id, from_status, to_status,
    reason_code, changed_by_profile_id
  ) values (
    target_organization_id, target_clinic_id, target_opportunity_id,
    v_current.status, target_decision, target_reason_code, v_actor
  );

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'recovery.opportunity.decided',
    'recovery_opportunity', target_opportunity_id, request_id, 'success',
    jsonb_build_object(
      'clinic_id', target_clinic_id,
      'decision', target_decision,
      'reason_code', target_reason_code,
      'rule_code', v_current.rule_code
    )
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, target_opportunity_id
  );
  return target_opportunity_id;
end;
$$;

create or replace function public.decide_recovery_action(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_action_id uuid,
  target_decision public.recovery_action_status,
  target_reason_code text,
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
  v_current public.recovery_actions%rowtype;
  v_opportunity public.recovery_opportunities%rowtype;
  v_existing_id uuid;
  v_scope text := 'recovery.action.decide.' || target_action_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'action', target_action_id,
    'decision', target_decision,
    'reason', target_reason_code
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_read_recovery(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Recovery decision denied';
  end if;
  if target_decision not in ('approved', 'rejected') then
    raise exception using errcode = '22023', message = 'Invalid action decision';
  end if;

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_request_hash
  );
  if v_existing_id is not null then return v_existing_id; end if;

  select * into v_current
  from public.recovery_actions
  where organization_id = target_organization_id
    and clinic_id = target_clinic_id
    and id = target_action_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Recovery action not found';
  end if;
  if v_current.status <> 'recommended' then
    raise exception using errcode = '23514', message = 'Action already decided';
  end if;
  if now() > v_current.expires_at then
    raise exception using errcode = '23514', message = 'Action expired';
  end if;

  select * into v_opportunity
  from public.recovery_opportunities
  where organization_id = target_organization_id
    and clinic_id = target_clinic_id
    and id = v_current.opportunity_id;
  if target_decision = 'approved' and v_opportunity.status <> 'approved' then
    raise exception using errcode = '23514',
      message = 'Action approval requires an approved opportunity';
  end if;

  update public.recovery_actions
  set status = target_decision,
      decided_by_profile_id = v_actor,
      decided_at = now(),
      reason_code = target_reason_code
  where id = target_action_id;

  insert into public.recovery_action_status_history (
    organization_id, clinic_id, action_id, from_status, to_status,
    reason_code, changed_by_profile_id
  ) values (
    target_organization_id, target_clinic_id, target_action_id,
    v_current.status, target_decision, target_reason_code, v_actor
  );

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'recovery.action.decided',
    'recovery_action', target_action_id, request_id, 'success',
    jsonb_build_object(
      'clinic_id', target_clinic_id,
      'decision', target_decision,
      'reason_code', target_reason_code,
      'action_type', v_current.action_type
    )
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, target_action_id
  );
  return target_action_id;
end;
$$;

create or replace function public.create_recovery_suppression(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_external_lead_ref text,
  target_reason public.recovery_suppression_reason,
  target_expires_at timestamptz,
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
  v_suppression_id uuid;
  v_existing_id uuid;
  v_scope text := 'recovery.suppression.create.' || target_clinic_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'clinic', target_clinic_id,
    'lead', target_external_lead_ref,
    'reason', target_reason,
    'expires_at', target_expires_at
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_read_recovery(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Recovery suppression denied';
  end if;
  if target_external_lead_ref is null
    or target_external_lead_ref !~ '^[A-Za-z0-9_.:-]{1,120}$' then
    raise exception using errcode = '22023', message = 'Invalid lead reference';
  end if;

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_request_hash
  );
  if v_existing_id is not null then return v_existing_id; end if;

  insert into public.recovery_suppressions (
    organization_id, clinic_id, external_lead_ref, reason, expires_at, created_by_profile_id
  ) values (
    target_organization_id, target_clinic_id, target_external_lead_ref,
    target_reason, target_expires_at, v_actor
  ) returning id into v_suppression_id;

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'recovery.suppression.created',
    'recovery_suppression', v_suppression_id, request_id, 'success',
    jsonb_build_object('clinic_id', target_clinic_id, 'reason', target_reason)
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_suppression_id
  );
  return v_suppression_id;
end;
$$;

create or replace function public.revoke_recovery_suppression(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_suppression_id uuid,
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
  v_current public.recovery_suppressions%rowtype;
  v_existing_id uuid;
  v_scope text := 'recovery.suppression.revoke.' || target_suppression_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'suppression', target_suppression_id
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_read_recovery(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Recovery suppression denied';
  end if;

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_request_hash
  );
  if v_existing_id is not null then return v_existing_id; end if;

  select * into v_current
  from public.recovery_suppressions
  where organization_id = target_organization_id
    and clinic_id = target_clinic_id
    and id = target_suppression_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Recovery suppression not found';
  end if;
  if v_current.revoked_at is not null then
    raise exception using errcode = '23514', message = 'Suppression already revoked';
  end if;

  update public.recovery_suppressions
  set revoked_at = now(), revoked_by_profile_id = v_actor
  where id = target_suppression_id;

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'recovery.suppression.revoked',
    'recovery_suppression', target_suppression_id, request_id, 'success',
    jsonb_build_object('clinic_id', target_clinic_id)
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, target_suppression_id
  );
  return target_suppression_id;
end;
$$;

create or replace function public.set_recovery_consent(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_external_lead_ref text,
  target_state public.recovery_consent_state,
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
  v_consent_id uuid;
  v_existing_id uuid;
  v_scope text := 'recovery.consent.set.' || target_clinic_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'clinic', target_clinic_id,
    'lead', target_external_lead_ref,
    'state', target_state
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_read_recovery(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Recovery consent denied';
  end if;
  if target_external_lead_ref is null
    or target_external_lead_ref !~ '^[A-Za-z0-9_.:-]{1,120}$' then
    raise exception using errcode = '22023', message = 'Invalid lead reference';
  end if;

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_request_hash
  );
  if v_existing_id is not null then return v_existing_id; end if;

  insert into public.recovery_consents (
    organization_id, clinic_id, external_lead_ref, state, created_by_profile_id
  ) values (
    target_organization_id, target_clinic_id, target_external_lead_ref, target_state, v_actor
  )
  on conflict (organization_id, clinic_id, external_lead_ref)
  do update set state = excluded.state, created_by_profile_id = excluded.created_by_profile_id
  returning id into v_consent_id;

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'recovery.consent.set',
    'recovery_consent', v_consent_id, request_id, 'success',
    jsonb_build_object('clinic_id', target_clinic_id, 'state', target_state)
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_consent_id
  );
  return v_consent_id;
end;
$$;

revoke all on function public.run_recovery_simulation(
  uuid, uuid, text, timestamptz, timestamptz, integer, jsonb, jsonb, text, text
) from public, anon;
revoke all on function public.decide_recovery_opportunity(
  uuid, uuid, uuid, public.recovery_opportunity_status, text, text, text
) from public, anon;
revoke all on function public.decide_recovery_action(
  uuid, uuid, uuid, public.recovery_action_status, text, text, text
) from public, anon;
revoke all on function public.create_recovery_suppression(
  uuid, uuid, text, public.recovery_suppression_reason, timestamptz, text, text
) from public, anon;
revoke all on function public.revoke_recovery_suppression(uuid, uuid, uuid, text, text) from public, anon;
revoke all on function public.set_recovery_consent(
  uuid, uuid, text, public.recovery_consent_state, text, text
) from public, anon;

grant execute on function public.run_recovery_simulation(
  uuid, uuid, text, timestamptz, timestamptz, integer, jsonb, jsonb, text, text
) to authenticated;
grant execute on function public.decide_recovery_opportunity(
  uuid, uuid, uuid, public.recovery_opportunity_status, text, text, text
) to authenticated;
grant execute on function public.decide_recovery_action(
  uuid, uuid, uuid, public.recovery_action_status, text, text, text
) to authenticated;
grant execute on function public.create_recovery_suppression(
  uuid, uuid, text, public.recovery_suppression_reason, timestamptz, text, text
) to authenticated;
grant execute on function public.revoke_recovery_suppression(uuid, uuid, uuid, text, text) to authenticated;
grant execute on function public.set_recovery_consent(
  uuid, uuid, text, public.recovery_consent_state, text, text
) to authenticated;

insert into public.feature_flags (key, description, default_enabled)
values (
  'recovery.engine.v1',
  'Habilita o Recovery Engine sem execução (simulação e decisões) da Fase 5.',
  false
)
on conflict (key) do nothing;
