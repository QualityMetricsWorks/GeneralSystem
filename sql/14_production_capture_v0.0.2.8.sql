-- GUVEL v0.0.2.8 Production Capture
create table if not exists public.production_records (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.companies(id) on delete restrict,
 production_date date not null default current_date,
 shift_id uuid not null references public.company_shifts(id) on delete restrict,
 machine_id uuid not null references public.machines(id) on delete restrict,
 part_number_id uuid not null references public.part_numbers(id) on delete restrict,
 quantity numeric(14,3) not null,
 notes text,
 created_by uuid not null references auth.users(id) on delete restrict,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint production_records_quantity_check check (quantity > 0)
);
create index if not exists production_records_company_date_idx on public.production_records(company_id, production_date desc);
create index if not exists production_records_machine_idx on public.production_records(machine_id);
create index if not exists production_records_part_idx on public.production_records(part_number_id);
alter table public.production_records enable row level security;
drop policy if exists production_records_select_own_company on public.production_records;
drop policy if exists production_records_insert_capture on public.production_records;
drop policy if exists production_records_update_manage on public.production_records;
create policy production_records_select_own_company on public.production_records for select to authenticated using (company_id=public.current_company_id());
create policy production_records_insert_capture on public.production_records for insert to authenticated with check (company_id=public.current_company_id() and created_by=auth.uid() and exists(select 1 from public.profiles where user_id=auth.uid() and company_id=public.current_company_id() and status='active' and role in ('administrator','manager','supervisor')));
create policy production_records_update_manage on public.production_records for update to authenticated using (company_id=public.current_company_id() and exists(select 1 from public.profiles where user_id=auth.uid() and company_id=public.current_company_id() and status='active' and role in ('administrator','manager'))) with check (company_id=public.current_company_id());
-- Prevent cross-company and incompatible machine/part combinations
create or replace function public.validate_production_record() returns trigger language plpgsql security definer set search_path=public as $$
declare mc uuid; pc uuid; sc uuid; rel_exists boolean; begin
 select company_id into mc from public.machines where id=new.machine_id;
 select company_id into pc from public.part_numbers where id=new.part_number_id;
 select company_id into sc from public.company_shifts where id=new.shift_id;
 if mc is distinct from new.company_id or pc is distinct from new.company_id or sc is distinct from new.company_id then raise exception 'Production record references another company'; end if;
 select exists(select 1 from public.machine_part_numbers where company_id=new.company_id and machine_id=new.machine_id and part_number_id=new.part_number_id and status='active') into rel_exists;
 if not rel_exists then raise exception 'Selected part number is not active for the selected machine'; end if;
 return new; end; $$;
drop trigger if exists validate_production_record_trigger on public.production_records;
create trigger validate_production_record_trigger before insert or update on public.production_records for each row execute function public.validate_production_record();
