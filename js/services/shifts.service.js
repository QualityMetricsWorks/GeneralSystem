import { supabase } from "./supabase.js";

export async function getCompanyShifts(companyId = null) {
  let query = supabase
    .from("company_shifts")
    .select("id, company_id, name, code, start_time, end_time, is_active")
    .eq("is_active", true);

  if (companyId) query = query.eq("company_id", companyId);

  const { data, error } = await query.order("start_time", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createCompanyShift(payload) {
  const { data, error } = await supabase
    .from("company_shifts")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCompanyShift(id, payload) {
  const { data, error } = await supabase
    .from("company_shifts")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
