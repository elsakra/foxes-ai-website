-- Foxes funnel: leads + builds. Run in Supabase SQL editor or via CLI.
-- Service role bypasses RLS — only server/API uses it.

create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  business_name text not null,
  industry text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  funnel_stage text not null default 'opted_in',
  intake jsonb not null default '{}'::jsonb,
  preview_url text,
  stripe_customer_id text,
  stripe_subscription_id text,
  anthropic_last_draft jsonb,
  meta_event_sent_at timestamptz
);


create table if not exists public.builds (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  status text not null default 'queued',
  draft_content jsonb,
  preview_url text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists builds_lead_idx on public.builds(lead_id);

alter table public.leads enable row level security;
alter table public.builds enable row level security;

-- Deny anon/authenticated JWT by default — app uses service role only for server routes.
create policy leads_no_anon_select on public.leads for select using (false);
create policy leads_no_anon_modify on public.leads for insert with check (false);
create policy builds_no_anon on public.builds for all using (false);
