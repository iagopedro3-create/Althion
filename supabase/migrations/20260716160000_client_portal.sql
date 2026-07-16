create type public.portal_request_category as enum (
  'access',
  'integration',
  'data_quality',
  'operational_support',
  'meeting',
  'other'
);
create type public.portal_request_status as enum (
  'open',
  'acknowledged',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed'
);
create type public.portal_request_priority as enum ('low', 'normal', 'high', 'urgent');
create type public.improvement_plan_status as enum ('draft', 'active', 'completed', 'archived');
create type public.portal_task_status as enum (
  'todo',
  'in_progress',
  'blocked',
  'completed',
  'cancelled'
);
create type public.portal_task_priority as enum ('low', 'normal', 'high');

alter table public.althion_scores
  add constraint althion_scores_org_clinic_id_key unique (organization_id, clinic_id, id);

alter table public.radar_recommendations
  add constraint radar_recommendations_org_clinic_id_key unique (organization_id, clinic_id, id);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  requester_profile_id uuid not null references public.profiles(id) on delete restrict,
  assignee_profile_id uuid references public.profiles(id) on delete restrict,
  category public.portal_request_category not null,
  subject text not null check (char_length(subject) between 5 and 160),
  details text not null check (char_length(details) between 10 and 1000),
  status public.portal_request_status not null default 'open',
  priority public.portal_request_priority not null default 'normal',
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  check ((status = 'closed') = (closed_at is not null)),
  check (status not in ('resolved', 'closed') or resolved_at is not null),
  unique (organization_id, id),
  unique (organization_id, clinic_id, id)
);

create table public.request_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  request_id uuid not null,
  from_status public.portal_request_status,
  to_status public.portal_request_status not null,
  reason_code text check (reason_code is null or reason_code ~ '^[a-z][a-z0-9_]{2,63}$'),
  changed_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  changed_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id, request_id)
    references public.requests(organization_id, clinic_id, id) on delete restrict,
  check (from_status is null or from_status <> to_status),
  unique (organization_id, id)
);

create table public.improvement_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  version integer not null check (version > 0),
  title text not null check (char_length(title) between 5 and 160),
  status public.improvement_plan_status not null default 'draft',
  source_score_id uuid,
  period_start date,
  period_end date,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  activated_at timestamptz,
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  foreign key (organization_id, clinic_id, source_score_id)
    references public.althion_scores(organization_id, clinic_id, id) on delete restrict,
  check ((period_start is null) = (period_end is null)),
  check (period_end is null or period_end >= period_start),
  check (
    (status = 'draft' and activated_at is null and completed_at is null and archived_at is null)
    or (
      status = 'active'
      and activated_at is not null
      and completed_at is null
      and archived_at is null
    )
    or (
      status = 'completed'
      and activated_at is not null
      and completed_at is not null
      and archived_at is null
    )
    or (status = 'archived' and archived_at is not null)
  ),
  unique (organization_id, clinic_id, version),
  unique (organization_id, id),
  unique (organization_id, clinic_id, id)
);

create unique index improvement_plans_one_active_per_clinic
  on public.improvement_plans(organization_id, clinic_id)
  where status = 'active';

create table public.improvement_plan_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  improvement_plan_id uuid not null,
  from_status public.improvement_plan_status,
  to_status public.improvement_plan_status not null,
  reason_code text check (reason_code is null or reason_code ~ '^[a-z][a-z0-9_]{2,63}$'),
  changed_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  changed_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id, improvement_plan_id)
    references public.improvement_plans(organization_id, clinic_id, id) on delete restrict,
  check (from_status is null or from_status <> to_status),
  unique (organization_id, id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  improvement_plan_id uuid not null,
  radar_recommendation_id uuid,
  title text not null check (char_length(title) between 5 and 160),
  status public.portal_task_status not null default 'todo',
  priority public.portal_task_priority not null default 'normal',
  assignee_profile_id uuid references public.profiles(id) on delete restrict,
  due_at timestamptz,
  completed_at timestamptz,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id, improvement_plan_id)
    references public.improvement_plans(organization_id, clinic_id, id) on delete restrict,
  foreign key (organization_id, clinic_id, radar_recommendation_id)
    references public.radar_recommendations(organization_id, clinic_id, id) on delete restrict,
  check ((status = 'completed') = (completed_at is not null)),
  unique (organization_id, id),
  unique (organization_id, clinic_id, id)
);

create table public.task_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  task_id uuid not null,
  from_status public.portal_task_status,
  to_status public.portal_task_status not null,
  reason_code text check (reason_code is null or reason_code ~ '^[a-z][a-z0-9_]{2,63}$'),
  changed_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  changed_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id, task_id)
    references public.tasks(organization_id, clinic_id, id) on delete restrict,
  check (from_status is null or from_status <> to_status),
  unique (organization_id, id)
);

create index requests_clinic_status_time_idx
  on public.requests(organization_id, clinic_id, status, created_at desc);
create index requests_requester_idx
  on public.requests(organization_id, clinic_id, requester_profile_id, created_at desc);
create index request_history_request_idx
  on public.request_status_history(organization_id, clinic_id, request_id, changed_at);
create index improvement_plans_clinic_time_idx
  on public.improvement_plans(organization_id, clinic_id, created_at desc);
create index improvement_plan_history_idx
  on public.improvement_plan_status_history(
    organization_id,
    clinic_id,
    improvement_plan_id,
    changed_at
  );
create index tasks_plan_status_idx
  on public.tasks(organization_id, clinic_id, improvement_plan_id, status, due_at);
create index task_history_task_idx
  on public.task_status_history(organization_id, clinic_id, task_id, changed_at);

create trigger requests_set_updated_at
before update on public.requests
for each row execute function public.set_updated_at();

create trigger improvement_plans_set_updated_at
before update on public.improvement_plans
for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create or replace function app_private.is_assigned_specialist(
  target_organization_id uuid,
  target_clinic_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.relationship_assignments assignment
    join public.relationship_specialists specialist on specialist.id = assignment.specialist_id
    where specialist.profile_id = app_private.current_profile_id()
      and specialist.status = 'active'
      and assignment.organization_id = target_organization_id
      and assignment.status = 'active'
      and assignment.starts_at <= now()
      and (assignment.ends_at is null or assignment.ends_at > now())
      and (assignment.clinic_id is null or assignment.clinic_id = target_clinic_id)
  )
$$;

create or replace function app_private.can_read_portal(
  target_organization_id uuid,
  target_clinic_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.can_access_clinic(target_organization_id, target_clinic_id)
    and (
      app_private.is_platform_admin()
      or app_private.has_org_role(
        target_organization_id,
        array[
          'organization_owner',
          'clinic_manager',
          'doctor',
          'viewer'
        ]::public.membership_role[]
      )
      or app_private.is_assigned_specialist(target_organization_id, target_clinic_id)
    )
$$;

create or replace function app_private.can_create_portal_request(
  target_organization_id uuid,
  target_clinic_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.can_access_clinic(target_organization_id, target_clinic_id)
    and (
      app_private.is_platform_admin()
      or app_private.has_org_role(
        target_organization_id,
        array['organization_owner', 'clinic_manager', 'doctor']::public.membership_role[]
      )
      or app_private.is_assigned_specialist(target_organization_id, target_clinic_id)
    )
$$;

create or replace function app_private.can_manage_portal(
  target_organization_id uuid,
  target_clinic_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.can_access_clinic(target_organization_id, target_clinic_id)
    and (
      app_private.is_platform_admin()
      or app_private.has_org_role(
        target_organization_id,
        array['organization_owner', 'clinic_manager']::public.membership_role[]
      )
      or app_private.is_assigned_specialist(target_organization_id, target_clinic_id)
    )
$$;

create or replace function app_private.can_read_portal_request(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_requester_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.can_manage_portal(target_organization_id, target_clinic_id)
    or (
      app_private.can_read_portal(target_organization_id, target_clinic_id)
      and (
        target_requester_profile_id = app_private.current_profile_id()
        or app_private.has_org_role(
          target_organization_id,
          array['viewer']::public.membership_role[]
        )
      )
    )
$$;

create or replace function app_private.profile_can_receive_portal_task(
  target_profile_id uuid,
  target_organization_id uuid,
  target_clinic_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships membership
    where membership.profile_id = target_profile_id
      and membership.organization_id = target_organization_id
      and membership.role in ('organization_owner', 'clinic_manager', 'doctor')
      and membership.status = 'active'
      and membership.revoked_at is null
      and membership.starts_at <= now()
      and (membership.expires_at is null or membership.expires_at > now())
      and (
        membership.role = 'organization_owner'
        or exists (
          select 1
          from public.membership_scopes scope
          where scope.organization_id = membership.organization_id
            and scope.membership_id = membership.id
            and (scope.clinic_id is null or scope.clinic_id = target_clinic_id)
        )
      )
  )
  or exists (
    select 1
    from public.relationship_assignments assignment
    join public.relationship_specialists specialist on specialist.id = assignment.specialist_id
    where specialist.profile_id = target_profile_id
      and specialist.status = 'active'
      and assignment.organization_id = target_organization_id
      and assignment.status = 'active'
      and assignment.starts_at <= now()
      and (assignment.ends_at is null or assignment.ends_at > now())
      and (assignment.clinic_id is null or assignment.clinic_id = target_clinic_id)
  )
$$;

create or replace function app_private.portal_request_transition_allowed(
  from_status public.portal_request_status,
  to_status public.portal_request_status
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case from_status
    when 'open' then to_status in ('acknowledged', 'closed')
    when 'acknowledged' then to_status in ('in_progress', 'closed')
    when 'in_progress' then to_status in ('waiting_customer', 'resolved', 'closed')
    when 'waiting_customer' then to_status in ('in_progress', 'resolved', 'closed')
    when 'resolved' then to_status in ('closed', 'in_progress')
    when 'closed' then false
  end
$$;

create or replace function app_private.improvement_plan_transition_allowed(
  from_status public.improvement_plan_status,
  to_status public.improvement_plan_status
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case from_status
    when 'draft' then to_status in ('active', 'archived')
    when 'active' then to_status in ('completed', 'archived')
    when 'completed' then to_status = 'archived'
    when 'archived' then false
  end
$$;

create or replace function app_private.portal_task_transition_allowed(
  from_status public.portal_task_status,
  to_status public.portal_task_status
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case from_status
    when 'todo' then to_status in ('in_progress', 'blocked', 'completed', 'cancelled')
    when 'in_progress' then to_status in ('blocked', 'completed', 'cancelled')
    when 'blocked' then to_status in ('todo', 'in_progress', 'cancelled')
    when 'completed' then false
    when 'cancelled' then false
  end
$$;

create or replace function app_private.claim_portal_idempotency(
  target_organization_id uuid,
  target_scope text,
  idempotency_key text,
  target_request_hash text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key_hash text;
  v_claim_id uuid;
  v_saved public.idempotency_records%rowtype;
begin
  if idempotency_key is null
    or char_length(idempotency_key) < 16
    or char_length(idempotency_key) > 200 then
    raise exception using errcode = '22023', message = 'Invalid idempotency key';
  end if;
  if char_length(target_scope) < 3 or char_length(target_scope) > 120 then
    raise exception using errcode = '22023', message = 'Invalid idempotency scope';
  end if;
  if char_length(target_request_hash) <> 64 then
    raise exception using errcode = '22023', message = 'Invalid request hash';
  end if;

  v_key_hash := encode(extensions.digest(convert_to(idempotency_key, 'UTF8'), 'sha256'), 'hex');

  insert into public.idempotency_records (
    organization_id,
    scope,
    key_hash,
    request_hash,
    status,
    expires_at
  ) values (
    target_organization_id,
    target_scope,
    v_key_hash,
    target_request_hash,
    'processing',
    now() + interval '24 hours'
  )
  on conflict (organization_id, scope, key_hash) do nothing
  returning id into v_claim_id;

  if v_claim_id is not null then
    return null;
  end if;

  select * into v_saved
  from public.idempotency_records
  where organization_id = target_organization_id
    and scope = target_scope
    and key_hash = v_key_hash;

  if v_saved.request_hash is distinct from target_request_hash then
    raise exception using errcode = '22023', message = 'Idempotency key reused with different payload';
  end if;
  if v_saved.status = 'completed' and v_saved.resource_id is not null then
    return v_saved.resource_id;
  end if;

  raise exception using errcode = 'P0001', message = 'Idempotent command is already processing';
end;
$$;

create or replace function app_private.complete_portal_idempotency(
  target_organization_id uuid,
  target_scope text,
  idempotency_key text,
  target_resource_id uuid
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.idempotency_records
  set status = 'completed', resource_id = target_resource_id, updated_at = now()
  where organization_id = target_organization_id
    and scope = target_scope
    and key_hash = encode(
      extensions.digest(convert_to(idempotency_key, 'UTF8'), 'sha256'),
      'hex'
    )
$$;

create or replace function app_private.reject_portal_history_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using errcode = '55000', message = 'Portal history is append-only';
end;
$$;

create trigger request_history_append_only
before update or delete on public.request_status_history
for each row execute function app_private.reject_portal_history_mutation();

create trigger improvement_plan_history_append_only
before update or delete on public.improvement_plan_status_history
for each row execute function app_private.reject_portal_history_mutation();

create trigger task_history_append_only
before update or delete on public.task_status_history
for each row execute function app_private.reject_portal_history_mutation();

revoke all on all functions in schema app_private from public, anon, authenticated;

alter table public.requests enable row level security;
alter table public.requests force row level security;
alter table public.request_status_history enable row level security;
alter table public.request_status_history force row level security;
alter table public.improvement_plans enable row level security;
alter table public.improvement_plans force row level security;
alter table public.improvement_plan_status_history enable row level security;
alter table public.improvement_plan_status_history force row level security;
alter table public.tasks enable row level security;
alter table public.tasks force row level security;
alter table public.task_status_history enable row level security;
alter table public.task_status_history force row level security;

create policy requests_select on public.requests
for select to authenticated
using (
  app_private.can_read_portal_request(organization_id, clinic_id, requester_profile_id)
);

create policy request_status_history_select on public.request_status_history
for select to authenticated
using (
  exists (
    select 1
    from public.requests request
    where request.organization_id = request_status_history.organization_id
      and request.clinic_id = request_status_history.clinic_id
      and request.id = request_status_history.request_id
      and app_private.can_read_portal_request(
        request.organization_id,
        request.clinic_id,
        request.requester_profile_id
      )
  )
);

create policy improvement_plans_select on public.improvement_plans
for select to authenticated
using (app_private.can_read_portal(organization_id, clinic_id));

create policy improvement_plan_status_history_select on public.improvement_plan_status_history
for select to authenticated
using (app_private.can_read_portal(organization_id, clinic_id));

create policy tasks_select on public.tasks
for select to authenticated
using (app_private.can_read_portal(organization_id, clinic_id));

create policy task_status_history_select on public.task_status_history
for select to authenticated
using (app_private.can_read_portal(organization_id, clinic_id));

grant select on public.requests to authenticated;
grant select on public.request_status_history to authenticated;
grant select on public.improvement_plans to authenticated;
grant select on public.improvement_plan_status_history to authenticated;
grant select on public.tasks to authenticated;
grant select on public.task_status_history to authenticated;

create or replace function public.create_portal_request(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_category public.portal_request_category,
  target_subject text,
  target_details text,
  target_priority public.portal_request_priority,
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
  v_request_id uuid;
  v_existing_id uuid;
  v_scope text := 'portal.request.create.' || target_clinic_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'clinic', target_clinic_id,
    'category', target_category,
    'subject', target_subject,
    'details', target_details,
    'priority', target_priority
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_create_portal_request(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Portal request access denied';
  end if;
  if v_actor is null then
    raise exception using errcode = '42501', message = 'Active profile required';
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

  insert into public.requests (
    organization_id,
    clinic_id,
    requester_profile_id,
    category,
    subject,
    details,
    priority
  ) values (
    target_organization_id,
    target_clinic_id,
    v_actor,
    target_category,
    target_subject,
    target_details,
    target_priority
  ) returning id into v_request_id;

  insert into public.request_status_history (
    organization_id,
    clinic_id,
    request_id,
    from_status,
    to_status,
    changed_by_profile_id
  ) values (
    target_organization_id,
    target_clinic_id,
    v_request_id,
    null,
    'open',
    v_actor
  );

  insert into public.audit_logs (
    organization_id,
    actor_profile_id,
    actor_type,
    action,
    resource_type,
    resource_id,
    request_id,
    result,
    metadata_redacted
  ) values (
    target_organization_id,
    v_actor,
    'user',
    'portal.request.created',
    'request',
    v_request_id,
    request_id,
    'success',
    jsonb_build_object('clinic_id', target_clinic_id, 'category', target_category, 'priority', target_priority)
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id,
    v_scope,
    idempotency_key,
    v_request_id
  );
  return v_request_id;
end;
$$;

create or replace function public.transition_portal_request(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_request_id uuid,
  target_status public.portal_request_status,
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
  v_current public.requests%rowtype;
  v_existing_id uuid;
  v_scope text := 'portal.request.transition.' || target_request_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'request', target_request_id,
    'status', target_status,
    'reason', target_reason_code
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_manage_portal(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Portal request management denied';
  end if;
  if target_reason_code is not null and target_reason_code !~ '^[a-z][a-z0-9_]{2,63}$' then
    raise exception using errcode = '22023', message = 'Invalid reason code';
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

  select * into v_current
  from public.requests
  where organization_id = target_organization_id
    and clinic_id = target_clinic_id
    and id = target_request_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Portal request not found';
  end if;
  if not app_private.portal_request_transition_allowed(v_current.status, target_status) then
    raise exception using errcode = '23514', message = 'Invalid portal request transition';
  end if;

  update public.requests
  set status = target_status,
      assignee_profile_id = case
        when target_status in ('acknowledged', 'in_progress')
          then coalesce(assignee_profile_id, v_actor)
        else assignee_profile_id
      end,
      acknowledged_at = case
        when target_status in ('acknowledged', 'in_progress')
          then coalesce(acknowledged_at, now())
        else acknowledged_at
      end,
      resolved_at = case
        when target_status in ('resolved', 'closed') then coalesce(resolved_at, now())
        when v_current.status = 'resolved' and target_status = 'in_progress' then null
        else resolved_at
      end,
      closed_at = case when target_status = 'closed' then now() else null end
  where id = target_request_id;

  insert into public.request_status_history (
    organization_id,
    clinic_id,
    request_id,
    from_status,
    to_status,
    reason_code,
    changed_by_profile_id
  ) values (
    target_organization_id,
    target_clinic_id,
    target_request_id,
    v_current.status,
    target_status,
    target_reason_code,
    v_actor
  );

  insert into public.audit_logs (
    organization_id,
    actor_profile_id,
    actor_type,
    action,
    resource_type,
    resource_id,
    request_id,
    result,
    metadata_redacted
  ) values (
    target_organization_id,
    v_actor,
    'user',
    'portal.request.transitioned',
    'request',
    target_request_id,
    request_id,
    'success',
    jsonb_build_object(
      'clinic_id', target_clinic_id,
      'from_status', v_current.status,
      'to_status', target_status,
      'reason_code', target_reason_code
    )
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id,
    v_scope,
    idempotency_key,
    target_request_id
  );
  return target_request_id;
end;
$$;

create or replace function public.create_improvement_plan(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_title text,
  target_source_score_id uuid,
  target_period_start date,
  target_period_end date,
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
  v_plan_id uuid;
  v_existing_id uuid;
  v_version integer;
  v_scope text := 'portal.plan.create.' || target_clinic_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'clinic', target_clinic_id,
    'title', target_title,
    'score', target_source_score_id,
    'period_start', target_period_start,
    'period_end', target_period_end
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_manage_portal(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Improvement plan management denied';
  end if;
  if (target_period_start is null) <> (target_period_end is null)
    or (target_period_end is not null and target_period_end < target_period_start) then
    raise exception using errcode = '22023', message = 'Invalid improvement plan period';
  end if;
  if target_source_score_id is not null and not exists (
    select 1 from public.althion_scores
    where organization_id = target_organization_id
      and clinic_id = target_clinic_id
      and id = target_source_score_id
  ) then
    raise exception using errcode = '23503', message = 'Source score does not belong to clinic';
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

  perform pg_advisory_xact_lock(hashtextextended(
    target_organization_id::text || ':' || target_clinic_id::text || ':improvement-plan',
    0
  ));
  select coalesce(max(version), 0) + 1 into v_version
  from public.improvement_plans
  where organization_id = target_organization_id and clinic_id = target_clinic_id;

  insert into public.improvement_plans (
    organization_id,
    clinic_id,
    version,
    title,
    source_score_id,
    period_start,
    period_end,
    created_by_profile_id
  ) values (
    target_organization_id,
    target_clinic_id,
    v_version,
    target_title,
    target_source_score_id,
    target_period_start,
    target_period_end,
    v_actor
  ) returning id into v_plan_id;

  insert into public.improvement_plan_status_history (
    organization_id,
    clinic_id,
    improvement_plan_id,
    from_status,
    to_status,
    changed_by_profile_id
  ) values (
    target_organization_id,
    target_clinic_id,
    v_plan_id,
    null,
    'draft',
    v_actor
  );

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'portal.plan.created', 'improvement_plan',
    v_plan_id, request_id, 'success',
    jsonb_build_object('clinic_id', target_clinic_id, 'version', v_version)
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id,
    v_scope,
    idempotency_key,
    v_plan_id
  );
  return v_plan_id;
end;
$$;

create or replace function public.transition_improvement_plan(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_plan_id uuid,
  target_status public.improvement_plan_status,
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
  v_current public.improvement_plans%rowtype;
  v_existing_id uuid;
  v_scope text := 'portal.plan.transition.' || target_plan_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'plan', target_plan_id,
    'status', target_status,
    'reason', target_reason_code
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_manage_portal(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Improvement plan management denied';
  end if;

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id,
    v_scope,
    idempotency_key,
    v_request_hash
  );
  if v_existing_id is not null then return v_existing_id; end if;

  select * into v_current
  from public.improvement_plans
  where organization_id = target_organization_id
    and clinic_id = target_clinic_id
    and id = target_plan_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Improvement plan not found';
  end if;
  if not app_private.improvement_plan_transition_allowed(v_current.status, target_status) then
    raise exception using errcode = '23514', message = 'Invalid improvement plan transition';
  end if;

  update public.improvement_plans
  set status = target_status,
      activated_at = case
        when target_status in ('active', 'completed')
          then coalesce(activated_at, now())
        else activated_at
      end,
      completed_at = case when target_status = 'completed' then now() else completed_at end,
      archived_at = case when target_status = 'archived' then now() else null end
  where id = target_plan_id;

  insert into public.improvement_plan_status_history (
    organization_id, clinic_id, improvement_plan_id, from_status, to_status,
    reason_code, changed_by_profile_id
  ) values (
    target_organization_id, target_clinic_id, target_plan_id, v_current.status,
    target_status, target_reason_code, v_actor
  );

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'portal.plan.transitioned', 'improvement_plan',
    target_plan_id, request_id, 'success',
    jsonb_build_object(
      'clinic_id', target_clinic_id,
      'from_status', v_current.status,
      'to_status', target_status,
      'reason_code', target_reason_code
    )
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, target_plan_id
  );
  return target_plan_id;
end;
$$;

create or replace function public.create_portal_task(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_plan_id uuid,
  target_title text,
  target_priority public.portal_task_priority,
  target_assignee_profile_id uuid,
  target_due_at timestamptz,
  target_radar_recommendation_id uuid,
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
  v_task_id uuid;
  v_existing_id uuid;
  v_scope text := 'portal.task.create.' || target_plan_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'plan', target_plan_id,
    'title', target_title,
    'priority', target_priority,
    'assignee', target_assignee_profile_id,
    'due_at', target_due_at,
    'recommendation', target_radar_recommendation_id
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_manage_portal(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Portal task management denied';
  end if;
  if not exists (
    select 1 from public.improvement_plans
    where organization_id = target_organization_id
      and clinic_id = target_clinic_id
      and id = target_plan_id
      and status in ('draft', 'active')
  ) then
    raise exception using errcode = '23503', message = 'Editable improvement plan not found';
  end if;
  if target_assignee_profile_id is not null and not app_private.profile_can_receive_portal_task(
    target_assignee_profile_id,
    target_organization_id,
    target_clinic_id
  ) then
    raise exception using errcode = '23503', message = 'Task assignee cannot access clinic';
  end if;
  if target_radar_recommendation_id is not null and not exists (
    select 1 from public.radar_recommendations
    where organization_id = target_organization_id
      and clinic_id = target_clinic_id
      and id = target_radar_recommendation_id
  ) then
    raise exception using errcode = '23503', message = 'Radar recommendation does not belong to clinic';
  end if;

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id,
    v_scope,
    idempotency_key,
    v_request_hash
  );
  if v_existing_id is not null then return v_existing_id; end if;

  insert into public.tasks (
    organization_id,
    clinic_id,
    improvement_plan_id,
    radar_recommendation_id,
    title,
    priority,
    assignee_profile_id,
    due_at,
    created_by_profile_id
  ) values (
    target_organization_id,
    target_clinic_id,
    target_plan_id,
    target_radar_recommendation_id,
    target_title,
    target_priority,
    target_assignee_profile_id,
    target_due_at,
    v_actor
  ) returning id into v_task_id;

  insert into public.task_status_history (
    organization_id, clinic_id, task_id, from_status, to_status, changed_by_profile_id
  ) values (
    target_organization_id, target_clinic_id, v_task_id, null, 'todo', v_actor
  );

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'portal.task.created', 'task',
    v_task_id, request_id, 'success',
    jsonb_build_object(
      'clinic_id', target_clinic_id,
      'plan_id', target_plan_id,
      'priority', target_priority,
      'has_due_at', target_due_at is not null,
      'has_assignee', target_assignee_profile_id is not null,
      'source_type', case when target_radar_recommendation_id is null then null else 'radar_recommendation' end
    )
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_task_id
  );
  return v_task_id;
end;
$$;

create or replace function public.transition_portal_task(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_task_id uuid,
  target_status public.portal_task_status,
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
  v_current public.tasks%rowtype;
  v_existing_id uuid;
  v_scope text := 'portal.task.transition.' || target_task_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'task', target_task_id,
    'status', target_status,
    'reason', target_reason_code
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_manage_portal(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Portal task management denied';
  end if;

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id,
    v_scope,
    idempotency_key,
    v_request_hash
  );
  if v_existing_id is not null then return v_existing_id; end if;

  select * into v_current
  from public.tasks
  where organization_id = target_organization_id
    and clinic_id = target_clinic_id
    and id = target_task_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Portal task not found';
  end if;
  if not app_private.portal_task_transition_allowed(v_current.status, target_status) then
    raise exception using errcode = '23514', message = 'Invalid portal task transition';
  end if;

  update public.tasks
  set status = target_status,
      completed_at = case when target_status = 'completed' then now() else null end
  where id = target_task_id;

  insert into public.task_status_history (
    organization_id, clinic_id, task_id, from_status, to_status,
    reason_code, changed_by_profile_id
  ) values (
    target_organization_id, target_clinic_id, target_task_id, v_current.status,
    target_status, target_reason_code, v_actor
  );

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'portal.task.transitioned', 'task',
    target_task_id, request_id, 'success',
    jsonb_build_object(
      'clinic_id', target_clinic_id,
      'from_status', v_current.status,
      'to_status', target_status,
      'reason_code', target_reason_code
    )
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, target_task_id
  );
  return target_task_id;
end;
$$;

create or replace function public.get_portal_people(
  target_organization_id uuid,
  target_clinic_id uuid
)
returns table (
  profile_id uuid,
  display_name text,
  person_kind text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not app_private.can_read_portal(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Portal people access denied';
  end if;

  return query
  select distinct people.profile_id, people.display_name, people.person_kind
  from (
    select
      profile.id as profile_id,
      profile.display_name,
      membership.role::text as person_kind
    from public.memberships membership
    join public.profiles profile on profile.id = membership.profile_id
    where membership.organization_id = target_organization_id
      and membership.role in ('organization_owner', 'clinic_manager', 'doctor')
      and membership.status = 'active'
      and membership.revoked_at is null
      and membership.starts_at <= now()
      and (membership.expires_at is null or membership.expires_at > now())
      and profile.status = 'active'
      and (
        membership.role = 'organization_owner'
        or exists (
          select 1
          from public.membership_scopes scope
          where scope.organization_id = membership.organization_id
            and scope.membership_id = membership.id
            and (scope.clinic_id is null or scope.clinic_id = target_clinic_id)
        )
      )

    union all

    select
      profile.id,
      profile.display_name,
      'relationship_specialist'
    from public.relationship_assignments assignment
    join public.relationship_specialists specialist on specialist.id = assignment.specialist_id
    join public.profiles profile on profile.id = specialist.profile_id
    where assignment.organization_id = target_organization_id
      and assignment.status = 'active'
      and assignment.starts_at <= now()
      and (assignment.ends_at is null or assignment.ends_at > now())
      and (assignment.clinic_id is null or assignment.clinic_id = target_clinic_id)
      and specialist.status = 'active'
      and profile.status = 'active'
  ) people
  order by people.display_name;
end;
$$;

create or replace function public.get_portal_specialist(
  target_organization_id uuid,
  target_clinic_id uuid
)
returns table (
  assignment_id uuid,
  profile_id uuid,
  display_name text,
  starts_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not app_private.can_read_portal(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Portal specialist access denied';
  end if;

  return query
  select assignment.id, profile.id, profile.display_name, assignment.starts_at
  from public.relationship_assignments assignment
  join public.relationship_specialists specialist on specialist.id = assignment.specialist_id
  join public.profiles profile on profile.id = specialist.profile_id
  where assignment.organization_id = target_organization_id
    and assignment.status = 'active'
    and assignment.starts_at <= now()
    and (assignment.ends_at is null or assignment.ends_at > now())
    and (assignment.clinic_id is null or assignment.clinic_id = target_clinic_id)
    and specialist.status = 'active'
    and profile.status = 'active'
  order by case when assignment.clinic_id = target_clinic_id then 0 else 1 end, assignment.starts_at desc
  limit 1;
end;
$$;

revoke all on function public.create_portal_request(
  uuid, uuid, public.portal_request_category, text, text,
  public.portal_request_priority, text, text
) from public, anon;
revoke all on function public.transition_portal_request(
  uuid, uuid, uuid, public.portal_request_status, text, text, text
) from public, anon;
revoke all on function public.create_improvement_plan(
  uuid, uuid, text, uuid, date, date, text, text
) from public, anon;
revoke all on function public.transition_improvement_plan(
  uuid, uuid, uuid, public.improvement_plan_status, text, text, text
) from public, anon;
revoke all on function public.create_portal_task(
  uuid, uuid, uuid, text, public.portal_task_priority, uuid, timestamptz, uuid, text, text
) from public, anon;
revoke all on function public.transition_portal_task(
  uuid, uuid, uuid, public.portal_task_status, text, text, text
) from public, anon;
revoke all on function public.get_portal_people(uuid, uuid) from public, anon;
revoke all on function public.get_portal_specialist(uuid, uuid) from public, anon;

grant execute on function public.create_portal_request(
  uuid, uuid, public.portal_request_category, text, text,
  public.portal_request_priority, text, text
) to authenticated;
grant execute on function public.transition_portal_request(
  uuid, uuid, uuid, public.portal_request_status, text, text, text
) to authenticated;
grant execute on function public.create_improvement_plan(
  uuid, uuid, text, uuid, date, date, text, text
) to authenticated;
grant execute on function public.transition_improvement_plan(
  uuid, uuid, uuid, public.improvement_plan_status, text, text, text
) to authenticated;
grant execute on function public.create_portal_task(
  uuid, uuid, uuid, text, public.portal_task_priority, uuid, timestamptz, uuid, text, text
) to authenticated;
grant execute on function public.transition_portal_task(
  uuid, uuid, uuid, public.portal_task_status, text, text, text
) to authenticated;
grant execute on function public.get_portal_people(uuid, uuid) to authenticated;
grant execute on function public.get_portal_specialist(uuid, uuid) to authenticated;

insert into public.feature_flags (key, description, default_enabled)
values (
  'portal.client.v1',
  'Habilita o Portal do Cliente source-backed da Fase 3.',
  false
)
on conflict (key) do nothing;
