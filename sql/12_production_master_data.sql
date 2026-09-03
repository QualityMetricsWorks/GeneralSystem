-- GUVEL v0.0.2.6 Production Master Data
-- Safe installation / migration script

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  name text not null,
  code text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers add column if not exists company_id uuid;
alter table public.customers add column if not exists name text;
alter table public.customers add column if not exists code text;
alter table public.customers add column if not exists status text default 'active';
alter table public.customers add column if not exists created_at timestamptz default now();
alter table public.customers add column if not exists updated_at timestamptz default now();

create table if not exists public.part_numbers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  part_number text not null,
  description text,
  unit_of_measure text not null default 'PCS',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.part_numbers add column if not exists company_id uuid;
alter table public.part_numbers add column if not exists customer_id uuid;
alter table public.part_numbers add column if not exists part_number text;
alter table public.part_numbers add column if not exists description text;
alter table public.part_numbers add column if not exists unit_of_measure text default 'PCS';
alter table public.part_numbers add column if not exists status text default 'active';
alter table public.part_numbers add column if not exists created_at timestamptz default now();
alter table public.part_numbers add column if not exists updated_at timestamptz default now();

alter table public.part_numbers alter column customer_id set not null;

alter table public.customers drop constraint if exists customers_status_check;
alter table public.customers add constraint customers_status_check check (status in ('active','inactive'));
alter table public.part_numbers drop constraint if exists part_numbers_status_check;
alter table public.part_numbers add constraint part_numbers_status_check check (status in ('active','inactive'));
alter table public.part_numbers drop constraint if exists part_numbers_uom_check;
alter table public.part_numbers add constraint part_numbers_uom_check check (unit_of_measure in ('PCS','EA','SET','KG','LB'));

create index if not exists customers_company_idx on public.customers(company_id);
create index if not exists part_numbers_company_idx on public.part_numbers(company_id);
create index if not exists part_numbers_customer_idx on public.part_numbers(customer_id);
create unique index if not exists customers_company_name_unique on public.customers(company_id, lower(name));
create unique index if not exists customers_company_code_unique on public.customers(company_id, lower(code));
create unique index if not exists part_numbers_company_number_unique on public.part_numbers(company_id, lower(part_number));

alter table public.customers enable row level security;
alter table public.part_numbers enable row level security;

drop policy if exists customers_select_own_company on public.customers;
drop policy if exists customers_insert_manage on public.customers;
drop policy if exists customers_update_manage on public.customers;
drop policy if exists parts_select_own_company on public.part_numbers;
drop policy if exists parts_insert_manage on public.part_numbers;
drop policy if exists parts_update_manage on public.part_numbers;

create policy customers_select_own_company on public.customers for select to authenticated using (company_id=public.current_company_id());
create policy customers_insert_manage on public.customers for insert to authenticated with check (company_id=public.current_company_id() and exists(select 1 from public.profiles where user_id=auth.uid() and company_id=public.current_company_id() and role in ('administrator','manager') and status='active'));
create policy customers_update_manage on public.customers for update to authenticated using (company_id=public.current_company_id() and exists(select 1 from public.profiles where user_id=auth.uid() and company_id=public.current_company_id() and role in ('administrator','manager') and status='active')) with check (company_id=public.current_company_id());
create policy parts_select_own_company on public.part_numbers for select to authenticated using (company_id=public.current_company_id());
create policy parts_insert_manage on public.part_numbers for insert to authenticated with check (company_id=public.current_company_id() and exists(select 1 from public.profiles where user_id=auth.uid() and company_id=public.current_company_id() and role in ('administrator','manager') and status='active'));
create policy parts_update_manage on public.part_numbers for update to authenticated using (company_id=public.current_company_id() and exists(select 1 from public.profiles where user_id=auth.uid() and company_id=public.current_company_id() and role in ('administrator','manager') and status='active')) with check (company_id=public.current_company_id());
