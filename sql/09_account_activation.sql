-- ============================================================
-- GUVEL General System v0.0.2.4
-- Account Activation
-- ============================================================

CREATE OR REPLACE FUNCTION public.activate_current_user_profile()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result public.profiles;
BEGIN
  UPDATE public.profiles
  SET
    status = 'active',
    activated_at = COALESCE(activated_at, now()),
    updated_at = now()
  WHERE user_id = auth.uid()
    AND status = 'invited'
  RETURNING * INTO v_result;

  IF v_result.user_id IS NULL THEN
    SELECT * INTO v_result
    FROM public.profiles
    WHERE user_id = auth.uid();
  END IF;

  IF v_result.user_id IS NULL THEN
    RAISE EXCEPTION 'User profile was not found';
  END IF;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_current_user_profile() TO authenticated;
