create table if not exists public.diagnosis_leads (
  id uuid primary key default gen_random_uuid(),
  clinic_name text not null check (char_length(clinic_name) between 2 and 160),
  responsible_name text not null check (char_length(responsible_name) between 2 and 120),
  whatsapp text not null check (char_length(whatsapp) between 8 and 40),
  email text check (email is null or char_length(email) between 3 and 160),
  niche text not null check (char_length(niche) between 2 and 120),
  professional_count integer not null check (professional_count between 1 and 10000),
  daily_contact_average integer not null check (daily_contact_average between 0 and 100000),
  main_difficulty text not null check (char_length(main_difficulty) between 10 and 2000),
  contact_consent boolean not null check (contact_consent),
  source text not null default 'landing_page' check (source in ('landing_page')),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.diagnosis_leads enable row level security;

revoke all on table public.diagnosis_leads from public, anon, authenticated;
grant select, insert, update on table public.diagnosis_leads to service_role;

create index if not exists diagnosis_leads_status_created_at_idx
  on public.diagnosis_leads (status, created_at desc);
