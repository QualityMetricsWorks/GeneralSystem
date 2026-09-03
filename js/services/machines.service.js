import { supabase } from './supabase.js';
export async function getMachines(){const {data,error}=await supabase.from('machines').select('*').order('machine_code');if(error)throw error;return data||[]}
export async function saveMachine(payload,id=null){const q=id?supabase.from('machines').update(payload).eq('id',id):supabase.from('machines').insert(payload);const {data,error}=await q.select().single();if(error)throw error;return data}
export async function getMachineParts(machineId){const {data,error}=await supabase.from('machine_part_numbers').select('*, part_numbers(id,part_number,description,unit_of_measure,customers(name))').eq('machine_id',machineId).order('part_number_id');if(error)throw error;return data||[]}
export async function saveMachinePart(payload,id=null){const q=id?supabase.from('machine_part_numbers').update(payload).eq('id',id):supabase.from('machine_part_numbers').insert(payload);const {data,error}=await q.select().single();if(error)throw error;return data}
