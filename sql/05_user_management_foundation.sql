-- GUVEL General System v0.0.2.0
-- Phase 2A: User Management Foundation
-- Run after the Golden Core Baseline SQL.

-- 1) Extend profiles with lifecycle metadata.
alter table public.profiles
  add column if not exists status text not null default 'active'
    check (status in ('invited','active','inactive')),
  add column if not exists invited_by uuid references auth.users(id),
  add column if not exists invited_at timestamptz,
  add column if not exists activated_at timestamptz,
  add column if not exists deactivated_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- 2) Normalize legacy/unknown role values only if present.
update public.profiles
set role = lower(trim(role))
where role is not null;

-- 3) Guardrail: official GUVEL v1 roles.
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('administrator','manager','supervisor','guest'));

-- 4) Guardrail: company user lifecycle values.
alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  add constraint profiles_status_check
  check (status in ('invited','active','inactive'));

-- 5) Performance indexes for future Users module.
create index if not exists idx_profiles_company_id
  on public.profiles(company_id);

create index if not exists idx_profiles_company_role
  on public.profiles(company_id, role);

create index if not exists idx_profiles_company_status
  on public.profiles(company_id, status);

-- 6) Helper functions.
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function public.can_manage_users()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('administrator','manager');
$$;

create or replace function public.can_manage_platform()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'administrator';
$$;

-- 7) Keep the core identity policy explicit.
-- Existing policies are intentionally not replaced here.
-- v0.0.2.1 will add Users-module policies and controlled UI operations.
