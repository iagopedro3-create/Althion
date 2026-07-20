-- Google Ads credentials hardening.
-- Secret material stays outside the exposed public schema and is never returned to clients.

create table app_private.google_ads_credential_secrets (
  credentials_id uuid primary key
    references public.google_ads_credentials(id) on delete cascade,
  refresh_token text not null,
  developer_token text not null,
  updated_at timestamptz not null default now()
);

revoke all on table app_private.google_ads_credential_secrets from public, anon, authenticated;

insert into app_private.google_ads_credential_secrets (
  credentials_id,
  refresh_token,
  developer_token,
  updated_at
)
select id, refresh_token, developer_token, updated_at
from public.google_ads_credentials;

drop policy if exists google_ads_credentials_select on public.google_ads_credentials;
revoke select on table public.google_ads_credentials from authenticated;

alter table public.google_ads_credentials
  drop column refresh_token,
  drop column developer_token;

create or replace function public.get_google_ads_connection(
  target_organization_id uuid,
  target_clinic_id uuid
)
returns table (
  id uuid,
  organization_id uuid,
  clinic_id uuid,
  customer_id text,
  status public.google_ads_status,
  last_sync_at timestamptz,
  last_error_code text,
  created_at timestamptz,
  updated_at timestamptz,
  created_by_profile_id uuid
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not app_private.can_manage_google_ads(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Manage Google Ads denied';
  end if;

  return query
  select
    credentials.id,
    credentials.organization_id,
    credentials.clinic_id,
    credentials.customer_id,
    credentials.status,
    credentials.last_sync_at,
    credentials.last_error_code,
    credentials.created_at,
    credentials.updated_at,
    credentials.created_by_profile_id
  from public.google_ads_credentials as credentials
  where credentials.organization_id = target_organization_id
    and credentials.clinic_id = target_clinic_id;
end;
$$;

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
  v_request_hash text;
begin
  if not app_private.can_manage_google_ads(target_organization_id, target_clinic_id) then
    raise exception using errcode = '42501', message = 'Manage Google Ads denied';
  end if;
  if v_actor is null then
    raise exception using errcode = '42501', message = 'Active profile required';
  end if;
  if target_refresh_token is null
    or target_developer_token is null
    or target_refresh_token !~ '^mock_'
    or target_developer_token !~ '^mock_' then
    raise exception using
      errcode = '22023',
      message = 'Only synthetic sandbox credentials are accepted';
  end if;
  if target_customer_id is null
    or char_length(target_refresh_token) > 512
    or char_length(target_developer_token) > 512
    or char_length(target_customer_id) not between 1 and 64
    or target_customer_id !~ '^[0-9-]+$' then
    raise exception using
      errcode = '22023',
      message = 'Invalid synthetic Google Ads credentials';
  end if;

  v_request_hash := encode(extensions.digest(convert_to(jsonb_build_object(
    'customer_id', target_customer_id,
    'developer_token_hash', encode(extensions.digest(target_developer_token, 'sha256'), 'hex'),
    'refresh_token_hash', encode(extensions.digest(target_refresh_token, 'sha256'), 'hex')
  )::text, 'UTF8'), 'sha256'), 'hex');

  v_existing_id := app_private.claim_portal_idempotency(
    target_organization_id, v_scope, idempotency_key, v_request_hash
  );
  if v_existing_id is not null then return v_existing_id; end if;

  insert into public.google_ads_credentials (
    organization_id,
    clinic_id,
    customer_id,
    status,
    created_by_profile_id
  ) values (
    target_organization_id,
    target_clinic_id,
    target_customer_id,
    'active',
    v_actor
  )
  on conflict (organization_id, clinic_id) do update
  set customer_id = excluded.customer_id,
      status = 'active',
      updated_at = now()
  returning id into v_cred_id;

  insert into app_private.google_ads_credential_secrets (
    credentials_id,
    refresh_token,
    developer_token
  ) values (
    v_cred_id,
    target_refresh_token,
    target_developer_token
  )
  on conflict (credentials_id) do update
  set refresh_token = excluded.refresh_token,
      developer_token = excluded.developer_token,
      updated_at = now();

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

revoke all on function public.get_google_ads_connection(uuid, uuid) from public, anon;
grant execute on function public.get_google_ads_connection(uuid, uuid) to authenticated;
