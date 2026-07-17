create type public.account_complexity as enum ('low', 'standard', 'high');
create type public.incident_category as enum (
  'integration_failure',
  'data_quality',
  'sla_breach',
  'engagement_risk',
  'operational',
  'other'
);
create type public.incident_severity as enum ('low', 'medium', 'high', 'critical');
create type public.incident_status as enum (
  'open',
  'investigating',
  'mitigated',
  'resolved',
  'closed'
);
create type public.meeting_purpose as enum (
  'onboarding',
  'checkin',
  'review',
  'escalation',
  'other'
);
create type public.meeting_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');

alter table public.relationship_assignments
  add column complexity public.account_complexity not null default 'standard';

create table public.account_incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  opened_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  assignee_profile_id uuid references public.profiles(id) on delete restrict,
  category public.incident_category not null,
  severity public.incident_severity not null default 'medium',
  status public.incident_status not null default 'open',
  subject text not null check (char_length(subject) between 5 and 160),
  details text not null check (char_length(details) between 10 and 1000),
  acknowledged_at timestamptz,
  mitigated_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  check ((status = 'closed') = (closed_at is not null)),
  check (status not in ('resolved', 'closed') or resolved_at is not null),
  check (status = 'open' or acknowledged_at is not null),
  unique (organization_id, id),
  unique (organization_id, clinic_id, id)
);

create table public.account_incident_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  incident_id uuid not null,
  from_status public.incident_status,
  to_status public.incident_status not null,
  reason_code text check (reason_code is null or reason_code ~ '^[a-z][a-z0-9_]{2,63}$'),
  changed_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  changed_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id, incident_id)
    references public.account_incidents(organization_id, clinic_id, id) on delete restrict,
  check (from_status is null or from_status <> to_status),
  unique (organization_id, id)
);

create table public.account_meetings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  specialist_profile_id uuid not null references public.profiles(id) on delete restrict,
  purpose public.meeting_purpose not null,
  status public.meeting_status not null default 'scheduled',
  scheduled_at timestamptz not null,
  completed_at timestamptz,
  cancelled_at timestamptz,
  summary text check (summary is null or char_length(summary) between 5 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  check ((status = 'completed') = (completed_at is not null)),
  check ((status = 'cancelled') = (cancelled_at is not null)),
  unique (organization_id, id),
  unique (organization_id, clinic_id, id)
);

create table public.account_meeting_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  meeting_id uuid not null,
  from_status public.meeting_status,
  to_status public.meeting_status not null,
  reason_code text check (reason_code is null or reason_code ~ '^[a-z][a-z0-9_]{2,63}$'),
  changed_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  changed_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id, meeting_id)
    references public.account_meetings(organization_id, clinic_id, id) on delete restrict,
  check (from_status is null or from_status <> to_status),
  unique (organization_id, id)
);

create index account_incidents_clinic_status_idx
  on public.account_incidents(organization_id, clinic_id, status, created_at desc);
create index account_incident_history_idx
  on public.account_incident_status_history(organization_id, clinic_id, incident_id, changed_at);
create index account_meetings_clinic_time_idx
  on public.account_meetings(organization_id, clinic_id, scheduled_at desc);
create index account_meeting_history_idx
  on public.account_meeting_status_history(organization_id, clinic_id, meeting_id, changed_at);

create trigger account_incidents_set_updated_at
before update on public.account_incidents
for each row execute function public.set_updated_at();

create trigger account_meetings_set_updated_at
before update on public.account_meetings
for each row execute function public.set_updated_at();

create or replace function app_private.can_access_cockpit(
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

create or replace function app_private.incident_transition_allowed(
  from_status public.incident_status,
  to_status public.incident_status
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case from_status
    when 'open' then to_status in ('investigating', 'resolved', 'closed')
    when 'investigating' then to_status in ('mitigated', 'resolved', 'closed')
    when 'mitigated' then to_status in ('investigating', 'resolved', 'closed')
    when 'resolved' then to_status in ('closed', 'investigating')
    when 'closed' then false
  end
$$;

create or replace function app_private.meeting_transition_allowed(
  from_status public.meeting_status,
  to_status public.meeting_status
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select from_status = 'scheduled' and to_status in ('completed', 'cancelled', 'no_show')
$$;

create or replace function app_private.reject_cockpit_history_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using errcode = '55000', message = 'Cockpit history is append-only';
end;
$$;

create trigger account_incident_history_append_only
before update or delete on public.account_incident_status_history
for each row execute function app_private.reject_cockpit_history_mutation();

create trigger account_meeting_history_append_only
before update or delete on public.account_meeting_status_history
for each row execute function app_private.reject_cockpit_history_mutation();

revoke all on all functions in schema app_private from public, anon, authenticated;

alter table public.account_incidents enable row level security;
alter table public.account_incidents force row level security;
alter table public.account_incident_status_history enable row level security;
alter table public.account_incident_status_history force row level security;
alter table public.account_meetings enable row level security;
alter table public.account_meetings force row level security;
alter table public.account_meeting_status_history enable row level security;
alter table public.account_meeting_status_history force row level security;

create policy account_incidents_select on public.account_incidents
for select to authenticated
using (app_private.can_access_cockpit(organization_id, clinic_id));

create policy account_incident_status_history_select on public.account_incident_status_history
for select to authenticated
using (app_private.can_access_cockpit(organization_id, clinic_id));

create policy account_meetings_select on public.account_meetings
for select to authenticated
using (app_private.can_access_cockpit(organization_id, clinic_id));

create policy account_meeting_status_history_select on public.account_meeting_status_history
for select to authenticated
using (app_private.can_access_cockpit(organization_id, clinic_id));

grant select on public.account_incidents to authenticated;
grant select on public.account_incident_status_history to authenticated;
grant select on public.account_meetings to authenticated;
grant select on public.account_meeting_status_history to authenticated;

create or replace function public.create_account_incident(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_category public.incident_category,
  target_severity public.incident_severity,
  target_subject text,
  target_details text,
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
  v_incident_id uuid;
  v_existing_id uuid;
  v_scope text := 'cockpit.incident.create.' || target_clinic_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'clinic', target_clinic_id,
    'category', target_category,
    'severity', target_severity,
    'subject', target_subject,
    'details', target_details
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_access_cockpit(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Cockpit incident access denied';
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

  insert into public.account_incidents (
    organization_id,
    clinic_id,
    opened_by_profile_id,
    category,
    severity,
    subject,
    details
  ) values (
    target_organization_id,
    target_clinic_id,
    v_actor,
    target_category,
    target_severity,
    target_subject,
    target_details
  ) returning id into v_incident_id;

  insert into public.account_incident_status_history (
    organization_id,
    clinic_id,
    incident_id,
    from_status,
    to_status,
    changed_by_profile_id
  ) values (
    target_organization_id,
    target_clinic_id,
    v_incident_id,
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
    'cockpit.incident.created',
    'account_incident',
    v_incident_id,
    request_id,
    'success',
    jsonb_build_object(
      'clinic_id', target_clinic_id,
      'category', target_category,
      'severity', target_severity
    )
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id,
    v_scope,
    idempotency_key,
    v_incident_id
  );
  return v_incident_id;
end;
$$;

create or replace function public.transition_account_incident(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_incident_id uuid,
  target_status public.incident_status,
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
  v_current public.account_incidents%rowtype;
  v_existing_id uuid;
  v_scope text := 'cockpit.incident.transition.' || target_incident_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'incident', target_incident_id,
    'status', target_status,
    'reason', target_reason_code
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_access_cockpit(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Cockpit incident management denied';
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
  from public.account_incidents
  where organization_id = target_organization_id
    and clinic_id = target_clinic_id
    and id = target_incident_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Account incident not found';
  end if;
  if not app_private.incident_transition_allowed(v_current.status, target_status) then
    raise exception using errcode = '23514', message = 'Invalid incident transition';
  end if;

  update public.account_incidents
  set status = target_status,
      assignee_profile_id = coalesce(assignee_profile_id, v_actor),
      acknowledged_at = coalesce(acknowledged_at, now()),
      mitigated_at = case
        when target_status = 'mitigated' then coalesce(mitigated_at, now())
        else mitigated_at
      end,
      resolved_at = case
        when target_status in ('resolved', 'closed') then coalesce(resolved_at, now())
        when target_status = 'investigating' then null
        else resolved_at
      end,
      closed_at = case when target_status = 'closed' then now() else null end
  where id = target_incident_id;

  insert into public.account_incident_status_history (
    organization_id,
    clinic_id,
    incident_id,
    from_status,
    to_status,
    reason_code,
    changed_by_profile_id
  ) values (
    target_organization_id,
    target_clinic_id,
    target_incident_id,
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
    'cockpit.incident.transitioned',
    'account_incident',
    target_incident_id,
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
    target_incident_id
  );
  return target_incident_id;
end;
$$;

create or replace function public.create_account_meeting(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_purpose public.meeting_purpose,
  target_scheduled_at timestamptz,
  target_summary text,
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
  v_meeting_id uuid;
  v_existing_id uuid;
  v_scope text := 'cockpit.meeting.create.' || target_clinic_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'clinic', target_clinic_id,
    'purpose', target_purpose,
    'scheduled_at', target_scheduled_at,
    'summary', target_summary
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_access_cockpit(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Cockpit meeting access denied';
  end if;
  if v_actor is null then
    raise exception using errcode = '42501', message = 'Active profile required';
  end if;
  if target_summary is not null
    and (char_length(target_summary) < 5 or char_length(target_summary) > 500) then
    raise exception using errcode = '22023', message = 'Invalid meeting summary';
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

  insert into public.account_meetings (
    organization_id,
    clinic_id,
    specialist_profile_id,
    purpose,
    scheduled_at,
    summary
  ) values (
    target_organization_id,
    target_clinic_id,
    v_actor,
    target_purpose,
    target_scheduled_at,
    target_summary
  ) returning id into v_meeting_id;

  insert into public.account_meeting_status_history (
    organization_id,
    clinic_id,
    meeting_id,
    from_status,
    to_status,
    changed_by_profile_id
  ) values (
    target_organization_id,
    target_clinic_id,
    v_meeting_id,
    null,
    'scheduled',
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
    'cockpit.meeting.created',
    'account_meeting',
    v_meeting_id,
    request_id,
    'success',
    jsonb_build_object(
      'clinic_id', target_clinic_id,
      'purpose', target_purpose,
      'scheduled_at', target_scheduled_at
    )
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id,
    v_scope,
    idempotency_key,
    v_meeting_id
  );
  return v_meeting_id;
end;
$$;

create or replace function public.transition_account_meeting(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_meeting_id uuid,
  target_status public.meeting_status,
  target_reason_code text,
  target_summary text,
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
  v_current public.account_meetings%rowtype;
  v_existing_id uuid;
  v_scope text := 'cockpit.meeting.transition.' || target_meeting_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'meeting', target_meeting_id,
    'status', target_status,
    'reason', target_reason_code,
    'summary', target_summary
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_access_cockpit(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Cockpit meeting management denied';
  end if;
  if target_reason_code is not null and target_reason_code !~ '^[a-z][a-z0-9_]{2,63}$' then
    raise exception using errcode = '22023', message = 'Invalid reason code';
  end if;
  if target_summary is not null
    and (char_length(target_summary) < 5 or char_length(target_summary) > 500) then
    raise exception using errcode = '22023', message = 'Invalid meeting summary';
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
  from public.account_meetings
  where organization_id = target_organization_id
    and clinic_id = target_clinic_id
    and id = target_meeting_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Account meeting not found';
  end if;
  if not app_private.meeting_transition_allowed(v_current.status, target_status) then
    raise exception using errcode = '23514', message = 'Invalid meeting transition';
  end if;

  update public.account_meetings
  set status = target_status,
      completed_at = case when target_status = 'completed' then now() else null end,
      cancelled_at = case when target_status = 'cancelled' then now() else null end,
      summary = coalesce(target_summary, summary)
  where id = target_meeting_id;

  insert into public.account_meeting_status_history (
    organization_id,
    clinic_id,
    meeting_id,
    from_status,
    to_status,
    reason_code,
    changed_by_profile_id
  ) values (
    target_organization_id,
    target_clinic_id,
    target_meeting_id,
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
    'cockpit.meeting.transitioned',
    'account_meeting',
    target_meeting_id,
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
    target_meeting_id
  );
  return target_meeting_id;
end;
$$;

revoke all on function public.create_account_incident(
  uuid, uuid, public.incident_category, public.incident_severity, text, text, text, text
) from public, anon;
revoke all on function public.transition_account_incident(
  uuid, uuid, uuid, public.incident_status, text, text, text
) from public, anon;
revoke all on function public.create_account_meeting(
  uuid, uuid, public.meeting_purpose, timestamptz, text, text, text
) from public, anon;
revoke all on function public.transition_account_meeting(
  uuid, uuid, uuid, public.meeting_status, text, text, text, text
) from public, anon;

grant execute on function public.create_account_incident(
  uuid, uuid, public.incident_category, public.incident_severity, text, text, text, text
) to authenticated;
grant execute on function public.transition_account_incident(
  uuid, uuid, uuid, public.incident_status, text, text, text
) to authenticated;
grant execute on function public.create_account_meeting(
  uuid, uuid, public.meeting_purpose, timestamptz, text, text, text
) to authenticated;
grant execute on function public.transition_account_meeting(
  uuid, uuid, uuid, public.meeting_status, text, text, text, text
) to authenticated;

insert into public.feature_flags (key, description, default_enabled)
values (
  'cockpit.specialist.v1',
  'Habilita o Cockpit interno do Especialista de Relacionamento da Fase 4.',
  false
)
on conflict (key) do nothing;
