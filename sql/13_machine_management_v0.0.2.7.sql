-- GUVEL v0.0.2.7 MACHINE MANAGEMENT
create table if not exists public.machines (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete restrict,
 machine_code text not null, machine_name text not null, machine_type text, status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint machines_status_check check (status in ('active','inactive'))
);
create table if not exists public.machine_part_numbers (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete restrict,
 machine_id uuid not null references public.machines(id) on delete restrict, part_number_id uuid not null references public.part_numbers(id) on delete restrict,
 standard_cycle_time_seconds numeric(14,3) not null, status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint machine_part_numbers_status_check check (status in ('active','inactive')),
 constraint machine_part_numbers_cycle_check check (standard_cycle_time_seconds > 0)
);
create unique index if not exists machines_company_code_unique on public.machines(company_id, lower(machine_code));
create unique index if not exists machine_part_numbers_unique on public.machine_part_numbers(machine_id,part_number_id);
create index if not exists machines_company_idx on public.machines(company_id);
create index if not exists machine_part_numbers_company_idx on public.machine_part_numbers(company_id);
create index if not exists machine_part_numbers_machine_idx on public.machine_part_numbers(machine_id);
alter table public.machines enable row level security; alter table public.machine_part_numbers enable row level security;
drop policy if exists machines_select_own_company on public.machines; drop policy if exists machines_insert_manage on public.machines; drop policy if exists machines_update_manage on public.machines;
create policy machines_select_own_company on public.machines for select to authenticated using (company_id=public.current_company_id());
create policy machines_insert_manage on public.machines for insert to authenticated with check (company_id=public.current_company_id() and exists(select 1 from public.profiles where user_id=auth.uid() and company_id=public.current_company_id() and role in ('administrator','manager') and status='active'));
create policy machines_update_manage on public.machines for update to authenticated using(company_id=public.current_company_id()) with check(company_id=public.current_company_id());
drop policy if exists machine_parts_select_own_company on public.machine_part_numbers; drop policy if exists machine_parts_insert_manage on public.machine_part_numbers; drop policy if exists machine_parts_update_manage on public.machine_part_numbers;
create policy machine_parts_select_own_company on public.machine_part_numbers for select to authenticated using(company_id=public.current_company_id());
create policy machine_parts_insert_manage on public.machine_part_numbers for insert to authenticated with check(company_id=public.current_company_id() and exists(select 1 from public.profiles where user_id=auth.uid() and company_id=public.current_company_id() and role in ('administrator','manager') and status='active'));
create policy machine_parts_update_manage on public.machine_part_numbers for update to authenticated using(company_id=public.current_company_id()) with check(company_id=public.current_company_id());
