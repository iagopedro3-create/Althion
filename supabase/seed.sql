-- Synthetic identities have no password and cannot sign in. Create a local login through
-- Supabase Studio when interactive authentication is needed.
insert into auth.users (id, email, raw_user_meta_data)
values
  ('80000000-0000-4000-8000-000000000001', 'owner-a@synthetic.althion.local', '{"display_name":"Owner A sintético"}'),
  ('80000000-0000-4000-8000-000000000002', 'manager-a@synthetic.althion.local', '{"display_name":"Manager A sintético"}'),
  ('80000000-0000-4000-8000-000000000003', 'viewer-b@synthetic.althion.local', '{"display_name":"Viewer B sintético"}'),
  ('80000000-0000-4000-8000-000000000004', 'specialist@synthetic.althion.local', '{"display_name":"Especialista sintético"}'),
  ('80000000-0000-4000-8000-000000000005', 'target@synthetic.althion.local', '{"display_name":"Target sintético"}'),
  ('80000000-0000-4000-8000-000000000006', 'operator-a@synthetic.althion.local', '{"display_name":"Operador A sintético"}'),
  ('80000000-0000-4000-8000-000000000007', 'doctor-a@synthetic.althion.local', '{"display_name":"Doctor A sintético"}'),
  ('80000000-0000-4000-8000-000000000008', 'viewer-a@synthetic.althion.local', '{"display_name":"Viewer A sintético"}');

insert into public.organizations (id, name, slug)
values
  ('10000000-0000-4000-8000-000000000001', 'Organização A sintética', 'organizacao-a-sintetica'),
  ('10000000-0000-4000-8000-000000000002', 'Organização B sintética', 'organizacao-b-sintetica');

insert into public.clinics (id, organization_id, name, slug)
values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Clínica A sintética', 'clinica-a-sintetica'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'Clínica B sintética', 'clinica-b-sintetica');

insert into public.units (id, organization_id, clinic_id, name)
values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Unidade A sintética'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Unidade B sintética');

insert into public.memberships (id, organization_id, profile_id, role)
select '40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', id, 'organization_owner'
from public.profiles where auth_user_id = '80000000-0000-4000-8000-000000000001';

insert into public.memberships (id, organization_id, profile_id, role)
select '40000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', id, 'clinic_manager'
from public.profiles where auth_user_id = '80000000-0000-4000-8000-000000000002';

insert into public.memberships (id, organization_id, profile_id, role)
select '40000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', id, 'viewer'
from public.profiles where auth_user_id = '80000000-0000-4000-8000-000000000003';

insert into public.memberships (id, organization_id, profile_id, role)
select '40000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', id, 'operator'
from public.profiles where auth_user_id = '80000000-0000-4000-8000-000000000006';

insert into public.memberships (id, organization_id, profile_id, role)
select '40000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001', id, 'doctor'
from public.profiles where auth_user_id = '80000000-0000-4000-8000-000000000007';

insert into public.memberships (id, organization_id, profile_id, role)
select '40000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', id, 'viewer'
from public.profiles where auth_user_id = '80000000-0000-4000-8000-000000000008';

insert into public.membership_scopes (organization_id, membership_id, clinic_id, unit_id)
values
  ('10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', null, null),
  ('10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', null),
  ('10000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000003', null, null),
  ('10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000001', null),
  ('10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000001', null),
  ('10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000001', null);

insert into public.relationship_specialists (id, profile_id)
select '50000000-0000-4000-8000-000000000001', id
from public.profiles where auth_user_id = '80000000-0000-4000-8000-000000000004';

insert into public.relationship_assignments (organization_id, specialist_id)
values ('10000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001');

insert into public.feature_flags (key, description, default_enabled)
values
  ('foundation.portal', 'Exibe o shell fundacional autenticado.', true),
  ('integration.helena', 'Habilita a integração de dados com a Helena (opcional; a Helena opera em paralelo).', false);

insert into public.feature_flag_overrides (organization_id, feature_flag_id, enabled, reason)
select
  '10000000-0000-4000-8000-000000000001',
  id,
  true,
  'Habilitação sintética para validar a Fase 2.'
from public.feature_flags
where key = 'radar.score.v1';

insert into public.feature_flag_overrides (organization_id, feature_flag_id, enabled, reason)
select
  '10000000-0000-4000-8000-000000000001',
  id,
  true,
  'Habilitação sintética para validar a Fase 3.'
from public.feature_flags
where key = 'portal.client.v1';

-- Fase 4 — Cockpit sintético: capacidade, segunda conta, incidente e reuniões.
update public.relationship_specialists
set capacity_limit = 10
where id = '50000000-0000-4000-8000-000000000001';

insert into public.relationship_assignments (id, organization_id, specialist_id, complexity)
values (
  '60000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000002',
  '50000000-0000-4000-8000-000000000001',
  'high'
);

insert into public.account_incidents (
  id, organization_id, clinic_id, opened_by_profile_id, category, severity, subject, details
)
select
  '70000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  profile.id,
  'data_quality',
  'high',
  'Cobertura do Radar em queda',
  'Cobertura declarada do último Radar caiu sem justificativa administrativa conhecida.'
from public.profiles profile
where profile.auth_user_id = '80000000-0000-4000-8000-000000000004';

insert into public.account_incident_status_history (
  organization_id, clinic_id, incident_id, from_status, to_status, changed_by_profile_id
)
select
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000001',
  null,
  'open',
  profile.id
from public.profiles profile
where profile.auth_user_id = '80000000-0000-4000-8000-000000000004';

insert into public.account_meetings (
  id, organization_id, clinic_id, specialist_profile_id, purpose, status,
  scheduled_at, completed_at, summary
)
select
  '71000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  profile.id,
  'checkin',
  'completed',
  now() - interval '10 days',
  now() - interval '10 days',
  'Check-in administrativo concluído com plano de acompanhamento revisado.'
from public.profiles profile
where profile.auth_user_id = '80000000-0000-4000-8000-000000000004';

insert into public.account_meeting_status_history (
  organization_id, clinic_id, meeting_id, from_status, to_status, changed_by_profile_id
)
select
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '71000000-0000-4000-8000-000000000001',
  status_change.from_status::public.meeting_status,
  status_change.to_status::public.meeting_status,
  profile.id
from public.profiles profile
cross join (
  values (null::text, 'scheduled'), ('scheduled', 'completed')
) as status_change(from_status, to_status)
where profile.auth_user_id = '80000000-0000-4000-8000-000000000004';

-- Habilitação sintética local do Cockpit apenas para a organização de demonstração.
insert into public.feature_flag_overrides (organization_id, feature_flag_id, enabled, reason)
select
  '10000000-0000-4000-8000-000000000001',
  id,
  true,
  'Habilita o Cockpit no ambiente local de demonstração'
from public.feature_flags
where key = 'cockpit.specialist.v1'
on conflict (organization_id, feature_flag_id) do update
set enabled = excluded.enabled,
    reason = excluded.reason,
    expires_at = null;

-- Fase 5 — Recovery sintético: consentimentos internos dos leads do MockCrmProvider e flag local.
insert into public.recovery_consents (
  organization_id, clinic_id, external_lead_ref, state, created_by_profile_id
)
select
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  lead_ref,
  'granted',
  profile.id
from public.profiles profile
cross join (values ('mock-lead-unanswered'), ('mock-lead-in-progress')) as leads(lead_ref)
where profile.auth_user_id = '80000000-0000-4000-8000-000000000004';

insert into public.feature_flag_overrides (organization_id, feature_flag_id, enabled, reason)
select
  '10000000-0000-4000-8000-000000000001',
  id,
  true,
  'Habilita o Recovery no ambiente local de demonstração'
from public.feature_flags
where key = 'recovery.engine.v1'
on conflict (organization_id, feature_flag_id) do update
set enabled = excluded.enabled,
    reason = excluded.reason,
    expires_at = null;

insert into public.integrations (organization_id, provider, status, capabilities, last_error_code)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'helena',
    'disabled',
    '{"listContacts":false,"listLeads":false,"listConversations":false,"listMessages":false,"listPipelines":false,"listOpportunities":false,"updateOpportunity":false,"createTask":false}',
    'PROVIDER_NOT_CONFIGURED'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'helena',
    'disabled',
    '{"listContacts":false,"listLeads":false,"listConversations":false,"listMessages":false,"listPipelines":false,"listOpportunities":false,"updateOpportunity":false,"createTask":false}',
    'PROVIDER_NOT_CONFIGURED'
  );
