import { supabase } from "./supabase.js";

export async function getProductionRecords(limit=200){
  const {data,error}=await supabase.from("production_records")
    .select("*, company_shifts(id,name,code), machines(id,machine_code,machine_name), part_numbers(id,part_number,description)")
    .order("production_date",{ascending:false}).order("created_at",{ascending:false}).limit(limit);
  if(error) throw error; return data||[];
}
export async function getProductionParts(machineId){
  const {data,error}=await supabase.from("machine_part_numbers")
    .select("part_number_id, standard_cycle_time_seconds, part_numbers(id,part_number,description,status)")
    .eq("machine_id",machineId).eq("status","active");
  if(error) throw error;
  return (data||[]).filter(x=>x.part_numbers?.status==="active");
}
export async function createProductionRecord(payload){
  const {data,error}=await supabase.from("production_records").insert(payload).select().single();
  if(error) throw error; return data;
}
