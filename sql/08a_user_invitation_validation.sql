-- ============================================================
-- GUVEL General System v0.0.2.3
-- Invitation Lifecycle Validation
-- ============================================================

select routine_name
from information_schema.routines
where routine_schema = 'public'
and routine_name in (
  'create_invited_company_profile',
  'activate_my_invitation'
)
order by routine_name;

select
  user_id,
  company_id,
  display_name,
  email,
  role,
  status,
  invited_by,
  invited_at,
  activated_at
from public.profiles
order by created_at;
