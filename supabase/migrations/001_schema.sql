create extension if not exists "pgcrypto";

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  applicant_name text not null check (char_length(applicant_name) between 2 and 120),
  business_type text not null,
  location text not null,
  loan_amount_kes integer not null check (loan_amount_kes > 0),
  mpesa_summary text not null,
  seasonal_pattern text not null,
  credit_score integer check (credit_score between 0 and 850),
  decision text check (decision in ('Approved', 'Human Review', 'Declined')),
  confidence integer check (confidence between 0 and 100),
  factors jsonb not null default '{}'::jsonb,
  fairness_flags jsonb not null default '[]'::jsonb,
  explanation text,
  recommended_amount integer check (recommended_amount >= 0),
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  event text not null,
  application_id text,
  agent text not null,
  status text not null check (status in ('completed', 'escalated', 'pending', 'failed')),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.consent_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  research_data_sharing boolean not null default false,
  credit_bureau_exchange boolean not null default false,
  african_jurisdiction_only boolean not null default true,
  ethics_board_oversight boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.appeals (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade,
  reason text not null check (char_length(reason) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.applications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.consent_settings enable row level security;
alter table public.appeals enable row level security;

create policy "authenticated read applications" on public.applications
  for select to authenticated using (true);
create policy "service write applications" on public.applications
  for all to service_role using (true) with check (true);

create policy "authenticated read audit logs" on public.audit_logs
  for select to authenticated using (true);
create policy "service write audit logs" on public.audit_logs
  for all to service_role using (true) with check (true);

create policy "users manage own consent" on public.consent_settings
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and african_jurisdiction_only = true);

create policy "authenticated read appeals" on public.appeals
  for select to authenticated using (true);
create policy "service write appeals" on public.appeals
  for all to service_role using (true) with check (true);

create index if not exists applications_created_at_idx on public.applications (created_at desc);
create index if not exists applications_decision_idx on public.applications (decision);
create index if not exists audit_logs_timestamp_idx on public.audit_logs (timestamp desc);
create index if not exists audit_logs_status_idx on public.audit_logs (status);
create index if not exists appeals_application_id_idx on public.appeals (application_id);
