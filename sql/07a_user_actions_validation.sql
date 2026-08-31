-- ============================================================
-- GUVEL General System v0.0.2.2
-- User Actions Validation
-- ============================================================

-- Verify action functions.
select routine_name
from information_schema.routines
where routine_schema = 'public'
and routine_name in (
  'can_manage_target_user',
  'update_company_user_role',
  'set_company_user_status'
)
order by routine_name;

-- Verify current company users.
select *
from public.get_company_users();
