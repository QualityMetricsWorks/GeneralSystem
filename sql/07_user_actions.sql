-- ============================================================
-- GUVEL General System v0.0.2.2
-- User Actions
-- ============================================================

-- Official management rules:
-- Administrator:
--   - Can manage Manager, Supervisor and Guest.
--   - Cannot change their own role/status through this module.
--   - Cannot manage another Administrator through this module.
--
-- Manager:
--   - Can manage Supervisor and Guest.
--   - Cannot manage Administrator or Manager accounts.
--   - Cannot change their own role/status through this module.
--
-- Database rules are authoritative. Frontend rules are only UX.

create or replace function public.can_manage_target_user(p_target_user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_actor_role text;
  v_target_role text;
  v_actor_company uuid;
  v_target_company uuid;
begin
  if auth.uid() is null then
    return false;
  end if;

  if p_target_user_id = auth.uid() then
    return false;
  end if;

  select role, company_id
    into v_actor_role, v_actor_company
  from public.profiles
  where user_id = auth.uid();

  select role, company_id
    into v_target_role, v_target_company
  from public.profiles
  where user_id = p_target_user_id;

  if v_actor_role is null or v_target_role is null then
    return false;
  end if;

  if v_actor_company is distinct from v_target_company then
    return false;
  end if;

  if v_actor_role = 'administrator' then
    return v_target_role in ('manager','supervisor','guest');
  end if;

  if v_actor_role = 'manager' then
    return v_target_role in ('supervisor','guest');
  end if;

  return false;
end;
$$;

grant execute on function public.can_manage_target_user(uuid) to authenticated;


create or replace function public.update_company_user_role(
  p_target_user_id uuid,
  p_new_role text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text;
  v_target_role text;
  v_company_id uuid;
  v_target_company_id uuid;
  v_result public.profiles;
begin
  if p_new_role not in ('manager','supervisor','guest') then
    raise exception 'Invalid target role';
  end if;

  if not public.can_manage_target_user(p_target_user_id) then
    raise exception 'You are not allowed to manage this user';
  end if;

  select role, company_id
    into v_actor_role, v_company_id
  from public.profiles
  where user_id = auth.uid();

  select role, company_id
    into v_target_role, v_target_company_id
  from public.profiles
  where user_id = p_target_user_id;

  -- Managers may never assign Manager.
  if v_actor_role = 'manager' and p_new_role = 'manager' then
    raise exception 'Managers cannot assign the Manager role';
  end if;

  -- Administrator role is intentionally never assignable in v0.0.2.2.
  update public.profiles
  set role = p_new_role,
      updated_at = now()
  where user_id = p_target_user_id
    and company_id = v_company_id
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function public.update_company_user_role(uuid, text) to authenticated;


create or replace function public.set_company_user_status(
  p_target_user_id uuid,
  p_new_status text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_result public.profiles;
begin
  if p_new_status not in ('active','inactive') then
    raise exception 'Invalid user status';
  end if;

  if not public.can_manage_target_user(p_target_user_id) then
    raise exception 'You are not allowed to manage this user';
  end if;

  select company_id
    into v_company_id
  from public.profiles
  where user_id = auth.uid();

  update public.profiles
  set status = p_new_status,
      activated_at = case
        when p_new_status = 'active' then now()
        else activated_at
      end,
      deactivated_at = case
        when p_new_status = 'inactive' then now()
        else deactivated_at
      end,
      updated_at = now()
  where user_id = p_target_user_id
    and company_id = v_company_id
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function public.set_company_user_status(uuid, text) to authenticated;
