create type public.google_ads_status as enum ('active', 'disabled', 'error');

-- 1. google_ads_credentials
create table public.google_ads_credentials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  refresh_token text not null,
  developer_token text not null,
  customer_id text not null check (customer_id ~ '^[0-9-]+$'),
  status public.google_ads_status not null default 'disabled',
  last_sync_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  unique (organization_id, clinic_id)
);

-- 2. google_ads_campaigns
create table public.google_ads_campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  campaign_id text not null check (char_length(campaign_id) between 1 and 64),
  name text not null check (char_length(name) between 1 and 255),
  status text not null check (status in ('ENABLED', 'PAUSED', 'REMOVED', 'UNKNOWN')),
  budget_micros bigint not null default 0 check (budget_micros >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id)
    references public.clinics(organization_id, id) on delete restrict,
  unique (organization_id, clinic_id, campaign_id)
);

-- 3. google_ads_metrics
create table public.google_ads_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  campaign_id text not null,
  date date not null,
  clicks integer not null default 0 check (clicks >= 0),
  impressions integer not null default 0 check (impressions >= 0),
  cost_micros bigint not null default 0 check (cost_micros >= 0),
  conversions numeric not null default 0.0 check (conversions >= 0),
  created_at timestamptz not null default now(),
  foreign key (organization_id, clinic_id, campaign_id)
    references public.google_ads_campaigns(organization_id, clinic_id, campaign_id) on delete cascade,
  unique (organization_id, clinic_id, campaign_id, date)
);

-- Indexes
create index google_ads_credentials_clinic_idx
  on public.google_ads_credentials(organization_id, clinic_id);
create index google_ads_campaigns_clinic_idx
  on public.google_ads_campaigns(organization_id, clinic_id, status);
create index google_ads_metrics_date_idx
  on public.google_ads_metrics(organization_id, clinic_id, date desc);

-- Triggers for updated_at
create trigger google_ads_credentials_set_updated_at
before update on public.google_ads_credentials
for each row execute function public.set_updated_at();

create trigger google_ads_campaigns_set_updated_at
before update on public.google_ads_campaigns
for each row execute function public.set_updated_at();

-- Helper function for access control
create or replace function app_private.can_manage_google_ads(
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

-- RLS Enablement
alter table public.google_ads_credentials enable row level security;
alter table public.google_ads_credentials force row level security;
alter table public.google_ads_campaigns enable row level security;
alter table public.google_ads_campaigns force row level security;
alter table public.google_ads_metrics enable row level security;
alter table public.google_ads_metrics force row level security;

-- RLS Policies
create policy google_ads_credentials_select on public.google_ads_credentials
for select to authenticated
using (app_private.can_manage_google_ads(organization_id, clinic_id));

create policy google_ads_campaigns_select on public.google_ads_campaigns
for select to authenticated
using (app_private.can_manage_google_ads(organization_id, clinic_id));

create policy google_ads_metrics_select on public.google_ads_metrics
for select to authenticated
using (app_private.can_manage_google_ads(organization_id, clinic_id));

-- Grants
grant select on public.google_ads_credentials to authenticated;
grant select on public.google_ads_campaigns to authenticated;
grant select on public.google_ads_metrics to authenticated;

-- RPC: save_google_ads_credentials
create or replace function public.save_google_ads_credentials(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_refresh_token text,
  target_developer_token text,
  target_customer_id text,
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
  v_cred_id uuid;
  v_existing_id uuid;
  v_scope text := 'google_ads.credentials.' || target_clinic_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'customer_id', target_customer_id,
    'developer_token', target_developer_token
  )::text, 'UTF8'), 'sha256'), 'hex');
begin
  if not app_private.can_manage_google_ads(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Manage Google Ads denied';
  end if;
  if v_actor is null then
    raise exception using errcode = '42501', message = 'Active profile required';
  end if;

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_request_hash
  );
  if v_existing_id is not null then return v_existing_id; end if;

  insert into public.google_ads_credentials (
    organization_id, clinic_id, refresh_token, developer_token, customer_id, status, created_by_profile_id
  ) values (
    target_organization_id, target_clinic_id, target_refresh_token, target_developer_token, target_customer_id, 'active', v_actor
  )
  on conflict (organization_id, clinic_id) do update
  set refresh_token = excluded.refresh_token,
      developer_token = excluded.developer_token,
      customer_id = excluded.customer_id,
      status = 'active',
      updated_at = now()
  returning id into v_cred_id;

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'google_ads.credentials.saved',
    'google_ads_credentials', v_cred_id, request_id, 'success',
    jsonb_build_object('clinic_id', target_clinic_id, 'customer_id', target_customer_id)
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_cred_id
  );
  return v_cred_id;
end;
$$;

-- RPC: sync_google_ads_data
create or replace function public.sync_google_ads_data(
  target_organization_id uuid,
  target_clinic_id uuid,
  target_campaigns jsonb,
  target_metrics jsonb,
  idempotency_key text,
  request_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := app_private.current_profile_id();
  v_existing_id uuid;
  v_scope text := 'google_ads.sync.' || target_clinic_id::text;
  v_request_hash text := encode(extensions.digest(convert_to(jsonb_build_object(
    'campaigns_count', jsonb_array_length(target_campaigns),
    'metrics_count', jsonb_array_length(target_metrics)
  )::text, 'UTF8'), 'sha256'), 'hex');
  v_camp jsonb;
  v_met jsonb;
begin
  if not app_private.can_manage_google_ads(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Manage Google Ads denied';
  end if;

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_request_hash
  );
  if v_existing_id is not null then return true; end if;

  -- Sync Campaigns
  for v_camp in select * from jsonb_array_elements(target_campaigns)
  loop
    insert into public.google_ads_campaigns (
      organization_id, clinic_id, campaign_id, name, status, budget_micros
    ) values (
      target_organization_id,
      target_clinic_id,
      v_camp->>'campaign_id',
      v_camp->>'name',
      v_camp->>'status',
      (v_camp->>'budget_micros')::bigint
    )
    on conflict (organization_id, clinic_id, campaign_id) do update
    set name = excluded.name,
        status = excluded.status,
        budget_micros = excluded.budget_micros,
        updated_at = now();
  end loop;

  -- Sync Metrics
  for v_met in select * from jsonb_array_elements(target_metrics)
  loop
    insert into public.google_ads_metrics (
      organization_id, clinic_id, campaign_id, date, clicks, impressions, cost_micros, conversions
    ) values (
      target_organization_id,
      target_clinic_id,
      v_met->>'campaign_id',
      (v_met->>'date')::date,
      (v_met->>'clicks')::integer,
      (v_met->>'impressions')::integer,
      (v_met->>'cost_micros')::bigint,
      (v_met->>'conversions')::numeric
    )
    on conflict (organization_id, clinic_id, campaign_id, date) do update
    set clicks = excluded.clicks,
        impressions = excluded.impressions,
        cost_micros = excluded.cost_micros,
        conversions = excluded.conversions;
  end loop;

  update public.google_ads_credentials
  set status = 'active',
      last_sync_at = now(),
      last_error_code = null,
      updated_at = now()
  where organization_id = target_organization_id
    and clinic_id = target_clinic_id;

  insert into public.audit_logs (
    organization_id, actor_profile_id, actor_type, action, resource_type,
    resource_id, request_id, result, metadata_redacted
  ) values (
    target_organization_id, v_actor, 'user', 'google_ads.data.synced',
    'google_ads_credentials', target_clinic_id, request_id, 'success',
    jsonb_build_object('clinic_id', target_clinic_id, 'campaigns_count', jsonb_array_length(target_campaigns))
  );

  perform app_private.complete_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, target_clinic_id
  );
  return true;
end;
$$;

-- Revoke & Grant EXECUTE
revoke all on function public.save_google_ads_credentials(
  uuid, uuid, text, text, text, text, text
) from public, anon;
revoke all on function public.sync_google_ads_data(
  uuid, uuid, jsonb, jsonb, text, text
) from public, anon;

grant execute on function public.save_google_ads_credentials(
  uuid, uuid, text, text, text, text, text
) to authenticated;
grant execute on function public.sync_google_ads_data(
  uuid, uuid, jsonb, jsonb, text, text
) to authenticated;

-- Feature flag default desabilitado
insert into public.feature_flags (key, description, default_enabled)
values (
  'google.ads.v1',
  'Habilita o modulo de leitura do Google Ads (Fase 9).',
  false
)
on conflict (key) do nothing;
