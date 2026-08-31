-- ============================================================
-- GUVEL General System v0.0.2.0 VALIDATED
-- User Management Foundation
-- ============================================================

alter table public.profiles
  add column if not exists status text not null default 'active';

alter table public.profiles
  add column if not exists invited_by uuid references auth.users(id);

alter table public.profiles
  add column if not exists invited_at timestamptz;

alter table public.profiles
  add column if not exists activated_at timestamptz;

alter table public.profiles
  add column if not exists deactivated_at timestamptz;

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

alter table public.profiles
  drop constraint if exists profiles_role_check;

update public.profiles
set role = case
  when lower(trim(role)) in ('company_admin','admin','owner','administrator') then 'administrator'
  when lower(trim(role)) = 'manager' then 'manager'
  when lower(trim(role)) = 'supervisor' then 'supervisor'
  when lower(trim(role)) = 'guest' then 'guest'
  else lower(trim(role))
end
where role is not null;

do $$
begin
  if exists (
    select 1
    from public.profiles
    where role is null
       or role not in ('administrator','manager','supervisor','guest')
  ) then
    raise exception 'Invalid or unmapped legacy roles remain in public.profiles.';
  end if;
end $$;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('administrator','manager','supervisor','guest'));

alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  add constraint profiles_status_check
  check (status in ('invited','active','inactive'));

create index if not exists idx_profiles_company_id on public.profiles(company_id);
create index if not exists idx_profiles_company_role on public.profiles(company_id, role);
create index if not exists idx_profiles_company_status on public.profiles(company_id, status);

create or replace function public.current_user_role()
returns text language sql stable security definer
set search_path = public
as $$
  select role from public.profiles
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function public.can_manage_users()
returns boolean language sql stable security definer
set search_path = public
as $$
  select public.current_user_role() in ('administrator','manager');
$$;

create or replace function public.can_manage_platform()
returns boolean language sql stable security definer
set search_path = public
as $$
  select public.current_user_role() = 'administrator';
$$;
