import { supabase } from "./supabase.js";

export async function getCompanyUsers() {
  const { data, error } = await supabase.rpc("get_company_users");

  if (error) throw error;

  return data || [];
}


export async function updateCompanyUserRole(
  userId,
  role
) {
  const { data, error } =
    await supabase.rpc(
      "update_company_user_role",
      {
        p_target_user_id: userId,
        p_new_role: role
      }
    );

  if (error) throw error;

  return data;
}


export async function setCompanyUserStatus(
  userId,
  status
) {
  const { data, error } =
    await supabase.rpc(
      "set_company_user_status",
      {
        p_target_user_id: userId,
        p_new_status: status
      }
    );

  if (error) throw error;

  return data;
}


export async function inviteCompanyUser({
  displayName,
  email,
  role
}) {

  const {
    data: sessionData,
    error: sessionError
  } = await supabase.auth.getSession();


  console.log(
    "GUVEL current session:",
    sessionData.session
  );


  if (
    sessionError ||
    !sessionData.session
  ) {

    throw new Error(
      "Your GUVEL session has expired. Please sign in again."
    );

  }


  const {
    data,
    error
  } =
    await supabase.functions.invoke(
      "invite-company-user",
      {
        body: {
          display_name: displayName,
          email,
          role
        }
      }
    );


  if (error) {

    console.error(
      "GUVEL invitation error:",
      error
    );

    throw error;

  }


  if (data?.error) {

    throw new Error(
      data.error
    );

  }


  return data;

}
