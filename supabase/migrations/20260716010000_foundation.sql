create extension if not exists pgcrypto with schema extensions;

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create type public.organization_status as enum ('active', 'suspended', 'closed');
create type public.directory_status as enum ('active', 'inactive');
create type public.profile_status as enum ('active', 'disabled');
create type public.membership_role as enum (
  'organization_owner',
  'clinic_manager',
  'doctor',
  'operator',
  'viewer'
);
create type public.membership_status as enum ('active', 'invited', 'revoked', 'expired');
create type public.assignment_status as enum ('active', 'ended');
create type public.integration_status as enum ('disabled', 'blocked', 'connecting', 'active', 'error');
create type public.idempotency_status as enum ('processing', 'completed', 'failed');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status public.organization_status not null default 'active',
  timezone text not null default 'America/Sao_Paulo',
  retention_policy_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, status)
);

create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 160),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status public.directory_status not null default 'active',
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, id),
  unique (organization_id, slug)
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  name text not null check (char_length(name) between 2 and 160),
  status public.directory_status not null default 'active',
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  unique (organization_id, clinic_id, id)
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 160),
  locale text not null default 'pt-BR',
  status public.profile_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.membership_role not null,
  status public.membership_status not null default 'active',
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at is null or expires_at > starts_at),
  check ((status = 'revoked') = (revoked_at is not null)),
  unique (organization_id, id)
);

create unique index memberships_one_active_per_profile_organization
  on public.memberships (organization_id, profile_id)
  where status = 'active' and revoked_at is null;

create table public.membership_scopes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  membership_id uuid not null,
  clinic_id uuid,
  unit_id uuid,
  created_at timestamptz not null default now(),
  foreign key (organization_id, membership_id)
    references public.memberships(organization_id, id) on delete cascade,
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  foreign key (organization_id, clinic_id, unit_id)
    references public.units(organization_id, clinic_id, id) on delete restrict,
  check (unit_id is null or clinic_id is not null)
);

create unique index membership_scopes_unique_scope
  on public.membership_scopes (
    organization_id,
    membership_id,
    coalesce(clinic_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(unit_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create table public.platform_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role = 'platform_admin'),
  status public.directory_status not null default 'active',
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  check ((status = 'inactive') or revoked_at is null)
);

create unique index platform_roles_one_active_role
  on public.platform_roles(profile_id, role)
  where status = 'active' and revoked_at is null;

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  display_name text not null check (char_length(display_name) between 1 and 160),
  specialty_label text,
  status public.directory_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, id)
);

create table public.professional_units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  professional_id uuid not null,
  clinic_id uuid not null,
  unit_id uuid not null,
  status public.directory_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, professional_id)
    references public.professionals(organization_id, id) on delete cascade,
  foreign key (organization_id, clinic_id, unit_id)
    references public.units(organization_id, clinic_id, id) on delete cascade,
  unique (organization_id, professional_id, unit_id)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 160),
  default_duration_minutes integer check (default_duration_minutes between 5 and 1440),
  status public.directory_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, id)
);

create table public.relationship_specialists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  status public.directory_status not null default 'active',
  capacity_limit integer check (capacity_limit is null or capacity_limit > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.relationship_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  clinic_id uuid,
  specialist_id uuid not null references public.relationship_specialists(id) on delete restrict,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  status public.assignment_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  check (ends_at is null or ends_at > starts_at)
);

create unique index relationship_assignments_active_scope
  on public.relationship_assignments (
    organization_id,
    specialist_id,
    coalesce(clinic_id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) where status = 'active';

create table public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z][a-z0-9_.-]+$'),
  description text not null check (char_length(description) between 3 and 500),
  default_enabled boolean not null default false,
  rollout_type text not null default 'boolean' check (rollout_type = 'boolean'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.feature_flag_overrides (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  feature_flag_id uuid not null references public.feature_flags(id) on delete cascade,
  enabled boolean not null,
  expires_at timestamptz,
  reason text not null check (char_length(reason) between 3 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, feature_flag_id)
);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  provider text not null check (provider in ('helena', 'mock')),
  status public.integration_status not null default 'disabled',
  capabilities jsonb not null default '{}'::jsonb check (jsonb_typeof(capabilities) = 'object'),
  external_account_id text,
  config_reference text,
  last_success_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete restrict,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  actor_type text not null check (actor_type in ('user', 'system', 'integration')),
  action text not null check (char_length(action) between 3 and 120),
  resource_type text not null check (char_length(resource_type) between 2 and 120),
  resource_id uuid,
  occurred_at timestamptz not null default now(),
  request_id text check (request_id is null or char_length(request_id) <= 128),
  result text not null check (result in ('success', 'denied', 'failure')),
  metadata_redacted jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata_redacted) = 'object')
);

create table public.idempotency_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  scope text not null check (char_length(scope) between 3 and 120),
  key_hash text not null check (char_length(key_hash) = 64),
  request_hash text check (request_hash is null or char_length(request_hash) = 64),
  status public.idempotency_status not null default 'processing',
  resource_id uuid,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, scope, key_hash)
);

create index clinics_tenant_status_idx on public.clinics(organization_id, status) where deleted_at is null;
create index units_tenant_clinic_idx on public.units(organization_id, clinic_id) where deleted_at is null;
create index memberships_tenant_profile_idx on public.memberships(organization_id, profile_id, status);
create index membership_scopes_membership_idx on public.membership_scopes(organization_id, membership_id);
create index professionals_tenant_status_idx on public.professionals(organization_id, status) where deleted_at is null;
create index assignments_specialist_idx on public.relationship_assignments(specialist_id, status, organization_id);
create index audit_logs_tenant_time_idx on public.audit_logs(organization_id, occurred_at desc);
create index integrations_tenant_status_idx on public.integrations(organization_id, status);
create index idempotency_expiry_idx on public.idempotency_records(expires_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'organizations', 'clinics', 'units', 'profiles', 'memberships', 'professionals',
    'professional_units', 'services', 'relationship_specialists',
    'relationship_assignments', 'feature_flags', 'feature_flag_overrides',
    'integrations', 'idempotency_records'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      target_table
    );
  end loop;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(auth_user_id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Usuário'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
