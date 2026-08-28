import { supabase } from "../lib/supabase";

export async function getDepartments() {
  const { data, error } = await supabase
    .from("departments")
    .select("*, manager:employees!departments_manager_id_fkey(id, full_name)")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

export async function createDepartment(payload) {
  const { data, error } = await supabase
    .from("departments")
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateDepartment({ id, ...payload }) {
  const { data, error } = await supabase
    .from("departments")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteDepartment(id) {
  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
