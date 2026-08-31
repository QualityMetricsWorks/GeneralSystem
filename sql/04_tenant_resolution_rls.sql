-- GUVEL General System v0.0.1.3
-- Golden Core Baseline
-- Required to resolve an active tenant before authentication.

drop policy if exists "Public can resolve active tenants" on public.companies;

create policy "Public can resolve active tenants"
on public.companies
for select
to anon
using (status = 'active');
