create or replace function app_private.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from public.profiles
  where auth_user_id = auth.uid()
    and status = 'active'
  limit 1
$$;

create or replace function app_private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_roles
    where profile_id = app_private.current_profile_id()
      and role = 'platform_admin'
      and status = 'active'
      and revoked_at is null
  )
$$;

create or replace function app_private.has_org_membership(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships
    where organization_id = target_organization_id
      and profile_id = app_private.current_profile_id()
      and status = 'active'
      and revoked_at is null
      and starts_at <= now()
      and (expires_at is null or expires_at > now())
  )
$$;

create or replace function app_private.has_org_role(
  target_organization_id uuid,
  allowed_roles public.membership_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships
    where organization_id = target_organization_id
      and profile_id = app_private.current_profile_id()
      and role = any(allowed_roles)
      and status = 'active'
      and revoked_at is null
      and starts_at <= now()
      and (expires_at is null or expires_at > now())
  )
$$;

create or replace function app_private.has_active_assignment(target_organization_id uuid)
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
  )
$$;

create or replace function app_private.has_org_access(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.is_platform_admin()
    or app_private.has_org_membership(target_organization_id)
    or app_private.has_active_assignment(target_organization_id)
$$;

create or replace function app_private.can_access_clinic(
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
    or app_private.has_org_role(
      target_organization_id,
      array['organization_owner']::public.membership_role[]
    )
    or exists (
      select 1
      from public.memberships membership
      join public.membership_scopes scope
        on scope.organization_id = membership.organization_id
        and scope.membership_id = membership.id
      where membership.organization_id = target_organization_id
        and membership.profile_id = app_private.current_profile_id()
        and membership.status = 'active'
        and membership.revoked_at is null
        and membership.starts_at <= now()
        and (membership.expires_at is null or membership.expires_at > now())
        and (scope.clinic_id is null or scope.clinic_id = target_clinic_id)
    )
    or exists (
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

create or replace function app_private.can_manage_clinic(
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
    or app_private.has_org_role(
      target_organization_id,
      array['organization_owner']::public.membership_role[]
    )
    or (
      app_private.has_org_role(
        target_organization_id,
        array['clinic_manager']::public.membership_role[]
      )
      and app_private.can_access_clinic(target_organization_id, target_clinic_id)
    )
$$;

create or replace function app_private.can_manage_memberships(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.is_platform_admin()
    or app_private.has_org_role(
      target_organization_id,
      array['organization_owner']::public.membership_role[]
    )
$$;

create or replace function app_private.can_read_memberships(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.is_platform_admin()
    or app_private.has_org_role(
      target_organization_id,
      array['organization_owner', 'clinic_manager']::public.membership_role[]
    )
$$;

create or replace function app_private.can_read_audit(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.is_platform_admin()
    or app_private.has_org_role(
      target_organization_id,
      array['organization_owner']::public.membership_role[]
    )
$$;

revoke all on all functions in schema app_private from public, anon, authenticated;

alter table public.organizations enable row level security;
alter table public.organizations force row level security;
alter table public.clinics enable row level security;
alter table public.clinics force row level security;
alter table public.units enable row level security;
alter table public.units force row level security;
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.memberships enable row level security;
alter table public.memberships force row level security;
alter table public.membership_scopes enable row level security;
alter table public.membership_scopes force row level security;
alter table public.platform_roles enable row level security;
alter table public.platform_roles force row level security;
alter table public.professionals enable row level security;
alter table public.professionals force row level security;
alter table public.professional_units enable row level security;
alter table public.professional_units force row level security;
alter table public.services enable row level security;
alter table public.services force row level security;
alter table public.relationship_specialists enable row level security;
alter table public.relationship_specialists force row level security;
alter table public.relationship_assignments enable row level security;
alter table public.relationship_assignments force row level security;
alter table public.feature_flags enable row level security;
alter table public.feature_flags force row level security;
alter table public.feature_flag_overrides enable row level security;
alter table public.feature_flag_overrides force row level security;
alter table public.integrations enable row level security;
alter table public.integrations force row level security;
alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;
alter table public.idempotency_records enable row level security;
alter table public.idempotency_records force row level security;

create policy organizations_select on public.organizations
  for select to authenticated
  using (deleted_at is null and app_private.has_org_access(id));

create policy clinics_select on public.clinics
  for select to authenticated
  using (
    deleted_at is null
    and app_private.can_access_clinic(organization_id, id)
  );

create policy units_select on public.units
  for select to authenticated
  using (
    deleted_at is null
    and app_private.can_access_clinic(organization_id, clinic_id)
  );

create policy profiles_select on public.profiles
  for select to authenticated
  using (auth_user_id = auth.uid() or app_private.is_platform_admin());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

create policy memberships_select on public.memberships
  for select to authenticated
  using (
    profile_id = app_private.current_profile_id()
    or app_private.can_read_memberships(organization_id)
  );

create policy membership_scopes_select on public.membership_scopes
  for select to authenticated
  using (
    exists (
      select 1 from public.memberships membership
      where membership.id = membership_id
        and membership.organization_id = organization_id
        and (
          membership.profile_id = app_private.current_profile_id()
          or app_private.can_read_memberships(organization_id)
        )
    )
  );

create policy platform_roles_select on public.platform_roles
  for select to authenticated
  using (profile_id = app_private.current_profile_id() or app_private.is_platform_admin());

create policy professionals_select on public.professionals
  for select to authenticated
  using (deleted_at is null and app_private.has_org_access(organization_id));

create policy professional_units_select on public.professional_units
  for select to authenticated
  using (
    exists (
      select 1 from public.units unit
      where unit.id = unit_id
        and unit.organization_id = organization_id
        and app_private.can_access_clinic(organization_id, unit.clinic_id)
    )
  );

create policy services_select on public.services
  for select to authenticated
  using (deleted_at is null and app_private.has_org_access(organization_id));

create policy relationship_specialists_select on public.relationship_specialists
  for select to authenticated
  using (profile_id = app_private.current_profile_id() or app_private.is_platform_admin());

create policy relationship_assignments_select on public.relationship_assignments
  for select to authenticated
  using (
    app_private.is_platform_admin()
    or app_private.can_manage_memberships(organization_id)
    or specialist_id in (
      select id from public.relationship_specialists
      where profile_id = app_private.current_profile_id()
    )
  );

create policy feature_flags_select on public.feature_flags
  for select to authenticated using (true);

create policy feature_flag_overrides_select on public.feature_flag_overrides
  for select to authenticated using (app_private.has_org_access(organization_id));

create policy integrations_select on public.integrations
  for select to authenticated using (app_private.has_org_access(organization_id));

create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (
    organization_id is not null
    and app_private.can_read_audit(organization_id)
  );

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to authenticated;
grant select on public.organizations to authenticated;
grant select on public.clinics to authenticated;
grant select on public.units to authenticated;
grant select, update(display_name, locale) on public.profiles to authenticated;
grant select on public.memberships to authenticated;
grant select on public.membership_scopes to authenticated;
grant select on public.platform_roles to authenticated;
grant select on public.professionals to authenticated;
grant select on public.professional_units to authenticated;
grant select on public.services to authenticated;
grant select on public.relationship_specialists to authenticated;
grant select on public.relationship_assignments to authenticated;
grant select on public.feature_flags to authenticated;
grant select on public.feature_flag_overrides to authenticated;
grant select on public.integrations to authenticated;
grant select on public.audit_logs to authenticated;

create or replace function public.grant_membership(
  target_organization_id uuid,
  target_profile_id uuid,
  target_role public.membership_role,
  target_clinic_id uuid,
  target_unit_id uuid,
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
  idempotency_hash text;
  input_hash text;
  inserted_count integer;
  membership_id uuid;
  saved_request_hash text;
  saved_resource_id uuid;
  saved_status public.idempotency_status;
begin
  if actor_id is null or not app_private.can_manage_memberships(target_organization_id) then
    raise exception using errcode = '42501', message = 'Not authorized to manage memberships';
  end if;
  if char_length(idempotency_key) < 16 or char_length(idempotency_key) > 200 then
    raise exception using errcode = '22023', message = 'Invalid idempotency key';
  end if;
  if target_clinic_id is not null and not exists (
    select 1 from public.clinics
    where id = target_clinic_id and organization_id = target_organization_id and deleted_at is null
  ) then
    raise exception using errcode = '23503', message = 'Clinic does not belong to organization';
  end if;
  if target_unit_id is not null and (
    target_clinic_id is null or not exists (
      select 1 from public.units
      where id = target_unit_id
        and clinic_id = target_clinic_id
        and organization_id = target_organization_id
        and deleted_at is null
    )
  ) then
    raise exception using errcode = '23503', message = 'Unit does not belong to clinic';
  end if;

  idempotency_hash := encode(extensions.digest(idempotency_key, 'sha256'), 'hex');
  input_hash := encode(extensions.digest(
    concat_ws('|', target_profile_id, target_role, target_clinic_id, target_unit_id),
    'sha256'
  ), 'hex');

  insert into public.idempotency_records(
    organization_id, scope, key_hash, request_hash, expires_at
  ) values (
    target_organization_id,
    'membership:grant',
    idempotency_hash,
    input_hash,
    now() + interval '24 hours'
  ) on conflict (organization_id, scope, key_hash) do nothing;
  get diagnostics inserted_count = row_count;

  select request_hash, resource_id, status
  into saved_request_hash, saved_resource_id, saved_status
  from public.idempotency_records
  where organization_id = target_organization_id
    and scope = 'membership:grant'
    and key_hash = idempotency_hash
  for update;

  if inserted_count = 0 then
    if saved_request_hash is distinct from input_hash then
      raise exception using errcode = '22023', message = 'Idempotency key reused with different input';
    end if;
    if saved_status = 'completed' and saved_resource_id is not null then
      return saved_resource_id;
    end if;
  end if;

  insert into public.memberships(organization_id, profile_id, role)
  values (target_organization_id, target_profile_id, target_role)
  returning id into membership_id;

  insert into public.membership_scopes(
    organization_id, membership_id, clinic_id, unit_id
  ) values (
    target_organization_id, membership_id, target_clinic_id, target_unit_id
  );

  insert into public.audit_logs(
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, actor_id, 'user', 'membership.granted', 'membership',
    membership_id, request_id, 'success',
    jsonb_build_object(
      'role', target_role,
      'scope', case
        when target_unit_id is not null then 'unit'
        when target_clinic_id is not null then 'clinic'
        else 'organization'
      end
    )
  );

  update public.idempotency_records
  set status = 'completed', resource_id = membership_id
  where organization_id = target_organization_id
    and scope = 'membership:grant'
    and key_hash = idempotency_hash;

  return membership_id;
end;
$$;

create or replace function public.revoke_membership(
  target_organization_id uuid,
  target_membership_id uuid,
  idempotency_key text,
  request_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := app_private.current_profile_id();
  idempotency_hash text;
  input_hash text;
  inserted_count integer;
  saved_request_hash text;
  saved_status public.idempotency_status;
  target_profile uuid;
  target_membership_role public.membership_role;
begin
  if actor_id is null or not app_private.can_manage_memberships(target_organization_id) then
    raise exception using errcode = '42501', message = 'Not authorized to manage memberships';
  end if;
  if char_length(idempotency_key) < 16 or char_length(idempotency_key) > 200 then
    raise exception using errcode = '22023', message = 'Invalid idempotency key';
  end if;

  idempotency_hash := encode(extensions.digest(idempotency_key, 'sha256'), 'hex');
  input_hash := encode(extensions.digest(target_membership_id::text, 'sha256'), 'hex');

  insert into public.idempotency_records(
    organization_id, scope, key_hash, request_hash, expires_at
  ) values (
    target_organization_id,
    'membership:revoke',
    idempotency_hash,
    input_hash,
    now() + interval '24 hours'
  ) on conflict (organization_id, scope, key_hash) do nothing;
  get diagnostics inserted_count = row_count;

  select request_hash, status
  into saved_request_hash, saved_status
  from public.idempotency_records
  where organization_id = target_organization_id
    and scope = 'membership:revoke'
    and key_hash = idempotency_hash
  for update;

  if inserted_count = 0 then
    if saved_request_hash is distinct from input_hash then
      raise exception using errcode = '22023', message = 'Idempotency key reused with different input';
    end if;
    if saved_status = 'completed' then
      return;
    end if;
  end if;

  select profile_id, role into target_profile, target_membership_role
  from public.memberships
  where id = target_membership_id and organization_id = target_organization_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Membership not found';
  end if;

  if target_membership_role = 'organization_owner'
    and target_profile = actor_id
    and (
      select count(*) from public.memberships
      where organization_id = target_organization_id
        and role = 'organization_owner'
        and status = 'active'
        and revoked_at is null
    ) <= 1
  then
    raise exception using errcode = '23514', message = 'Cannot revoke the last organization owner';
  end if;

  update public.memberships
  set status = 'revoked', revoked_at = now()
  where id = target_membership_id
    and organization_id = target_organization_id
    and status <> 'revoked';

  insert into public.audit_logs(
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, actor_id, 'user', 'membership.revoked', 'membership',
    target_membership_id, request_id, 'success', '{}'::jsonb
  );

  update public.idempotency_records
  set status = 'completed', resource_id = target_membership_id
  where organization_id = target_organization_id
    and scope = 'membership:revoke'
    and key_hash = idempotency_hash;
end;
$$;

revoke all on function public.grant_membership(uuid, uuid, public.membership_role, uuid, uuid, text, text)
  from public, anon;
revoke all on function public.revoke_membership(uuid, uuid, text, text)
  from public, anon;
grant execute on function public.grant_membership(uuid, uuid, public.membership_role, uuid, uuid, text, text)
  to authenticated;
grant execute on function public.revoke_membership(uuid, uuid, text, text)
  to authenticated;
