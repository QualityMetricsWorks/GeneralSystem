import { supabase } from "./supabase.js";

export async function getCompany(companyId) {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, code, slug, timezone, status, created_at, updated_at")
    .eq("id", companyId)
    .single();
  if (error) throw error;
  return data;
}
