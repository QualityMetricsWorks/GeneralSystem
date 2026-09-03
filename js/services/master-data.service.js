import { supabase } from './supabase.js';

export async function getCustomers(){
  const {data,error}=await supabase.from('customers').select('*').order('name');
  if(error) throw error;
  return data||[];
}

export async function saveCustomer(payload,id=null){
  const query=id
    ? supabase.from('customers').update(payload).eq('id',id)
    : supabase.from('customers').insert(payload);
  const {data,error}=await query.select().single();
  if(error) throw error;
  return data;
}

export async function getPartNumbers(){
  const {data,error}=await supabase
    .from('part_numbers')
    .select('*, customers(name,code)')
    .order('part_number');
  if(error) throw error;
  return data||[];
}

export async function savePartNumber(payload,id=null){
  const query=id
    ? supabase.from('part_numbers').update(payload).eq('id',id)
    : supabase.from('part_numbers').insert(payload);
  const {data,error}=await query.select().single();
  if(error) throw error;
  return data;
}
