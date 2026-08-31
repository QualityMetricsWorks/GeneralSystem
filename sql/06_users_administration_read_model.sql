-- ============================================================
-- GUVEL General System v0.0.2.1
-- Users Administration - Read Model
-- ============================================================
-- This migration is intentionally READ-FIRST.
-- It does not create invitations, users, passwords or deletion flows.
-- It provides a safe tenant-scoped user directory for the Users module.

-- 1. Store a profile email for application-level display/search.
alter table public.profiles
  add column if not exists email text;

-- Backfill the current authenticated user's email when available.
update public.profiles
set email = (
  select au.email
  from auth.users au
  where au.id = public.profiles.user_id
)
where email is null;

-- Normalize stored email.
update public.profiles
set email = lower(trim(email))
where email is not null;

-- Optional uniqueness inside a tenant.
create unique index if not exists uq_profiles_company_email
  on public.profiles(company_id, email)
  where email is not null;

create index if not exists idx_profiles_company_display_name
  on public.profiles(company_id, display_name);

-- 2. Read helper.
-- SECURITY DEFINER keeps the module independent from direct auth.users access.
-- The function returns users only from the caller's current company.
create or replace function public.get_company_users()
returns table (
  user_id uuid,
  display_name text,
  email text,
  role text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  invited_at timestamptz,
  activated_at timestamptz,
  deactivated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.user_id,
    p.display_name,
    p.email,
    p.role,
    p.status,
    p.created_at,
    p.updated_at,
    p.invited_at,
    p.activated_at,
    p.deactivated_at
  from public.profiles p
  where p.company_id = public.current_company_id()
  order by lower(coalesce(p.display_name, p.email)), p.created_at;
$$;

grant execute on function public.get_company_users() to authenticated;

-- v0.0.2.1 intentionally does not grant write access.
