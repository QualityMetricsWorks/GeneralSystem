-- ============================================================
-- GUVEL General System v0.0.2.3
-- User Invitation Lifecycle
-- ============================================================

-- Add a controlled profile creation function.
-- This function is intended to be called only by the GUVEL invite-user
-- Edge Function after the auth user has been created.

create or replace function public.create_invited_company_profile(
  p_user_id uuid,
  p_company_id uuid,
  p_display_name text,
  p_email text,
  p_role text,
  p_invited_by uuid
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_company uuid;
  v_actor_role text;
  v_result public.profiles;
begin
  if p_role not in ('manager','supervisor','guest') then
    raise exception 'Invalid invitation role';
  end if;

  select company_id, role
    into v_actor_company, v_actor_role
  from public.profiles
  where user_id = p_invited_by;

  if v_actor_company is null then
    raise exception 'Inviting user has no company profile';
  end if;

  if v_actor_company is distinct from p_company_id then
    raise exception 'Cross-company invitation is not allowed';
  end if;

  if v_actor_role = 'administrator' then
    null;
  elsif v_actor_role = 'manager' and p_role in ('supervisor','guest') then
    null;
  else
    raise exception 'Inviting user is not allowed to assign this role';
  end if;

  insert into public.profiles (
    user_id,
    company_id,
    role,
    display_name,
    email,
    status,
    invited_by,
    invited_at,
    created_at,
    updated_at
  )
  values (
    p_user_id,
    p_company_id,
    p_role,
    nullif(trim(p_display_name), ''),
    lower(trim(p_email)),
    'invited',
    p_invited_by,
    now(),
    now(),
    now()
  )
  on conflict (user_id) do update
  set display_name = excluded.display_name,
      email = excluded.email,
      role = excluded.role,
      status = 'invited',
      invited_by = excluded.invited_by,
      invited_at = excluded.invited_at,
      updated_at = now()
  returning * into v_result;

  return v_result;
end;
$$;

-- Authenticated clients should not call this directly.
revoke all on function public.create_invited_company_profile(
  uuid, uuid, text, text, text, uuid
) from public;

grant execute on function public.create_invited_company_profile(
  uuid, uuid, text, text, text, uuid
) to service_role;


-- Controlled activation helper.
-- This is safe for the invited user to call only for their own profile.
create or replace function public.activate_my_invitation()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.profiles;
begin
  update public.profiles
  set status = 'active',
      activated_at = coalesce(activated_at, now()),
      updated_at = now()
  where user_id = auth.uid()
    and status = 'invited'
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function public.activate_my_invitation() to authenticated;
