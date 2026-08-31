import { supabase } from "./supabase.js";

export async function getCompanyUsers() {
  const { data, error } = await supabase.rpc("get_company_users");
  if (error) throw error;
  return data || [];
}
