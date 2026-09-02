import { supabase } from "./supabase.js";

export async function getCompanyShifts() {
  const { data, error } = await supabase
    .from("company_shifts")
    .select("*")
    .order("start_time", { ascending: true });
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
