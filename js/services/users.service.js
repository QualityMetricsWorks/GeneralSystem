import { supabase } from "./supabase.js";

export async function getCompanyUsers() {
  const { data, error } = await supabase.rpc("get_company_users");
  if (error) throw error;
  return data || [];
}

export async function updateCompanyUserRole(userId, role) {
  const { data, error } = await supabase.rpc("update_company_user_role", {
    p_target_user_id: userId,
    p_new_role: role
  });
  if (error) throw error;
  return data;
}

export async function setCompanyUserStatus(userId, status) {
  const { data, error } = await supabase.rpc("set_company_user_status", {
    p_target_user_id: userId,
    p_new_status: status
  });
  if (error) throw error;
  return data;
}
