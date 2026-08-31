import { supabase } from "../lib/supabase";

export async function getEmployees({ search = "", departmentId = "", role = "" } = {}) {
  let q = supabase
    .from("employees")
    .select("*, department:departments!employees_department_id_fkey(id, name), manager:manager_id(id, full_name)")
    .order("full_name");

  if (search) {
    const { data: matchingDepartments } = await supabase
      .from("departments")
      .select("id")
      .ilike("name", `%${search}%`);

    const orFilters = [`full_name.ilike.%${search}%`, `email.ilike.%${search}%`];
    if (matchingDepartments?.length) {
      orFilters.push(`department_id.in.(${matchingDepartments.map((d) => d.id).join(",")})`);
    }
    q = q.or(orFilters.join(","));
  }
  if (departmentId) q = q.eq("department_id", departmentId);
  if (role) q = q.eq("role", role);
  

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
}

export async function getEmployee(id) {
  const { data, error } = await supabase
    .from("employees")
    .select("*, department:departments!employees_department_id_fkey(id, name), manager:manager_id(id, full_name)")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createEmployee(payload) {
  const { error } = await supabase.from("employees").insert(clean(payload));
  if (error) {
    if (error.code === "23505") {
      throw new Error("An employee with this email already exists.");
    }
    throw new Error(error.message);
  }
}

export async function updateEmployee({ id, ...payload }) {
  const { data, error } = await supabase
    .from("employees")
    .update(clean(payload))
    .eq("id", id)
    .select()
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("An employee with this email already exists.");
    }
    throw new Error(error.message);
  }
  return data;
}

export async function deactivateEmployee(id) {
  const { error } = await supabase
    .from("employees")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteEmployee(id) {
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// empty strings would break uuid / numeric columns
function clean(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v])
  );
}
