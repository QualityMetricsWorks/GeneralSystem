-- GUVEL General System v0.0.2.1
-- Users Administration validation

-- 1. Check profile email availability.
select
  user_id,
  company_id,
  display_name,
  email,
  role,
  status
from public.profiles
order by created_at;

-- 2. Test the tenant-scoped read helper while authenticated.
select *
from public.get_company_users();

-- 3. Verify the function exists.
select routine_name
from information_schema.routines
where routine_schema = 'public'
and routine_name = 'get_company_users';
