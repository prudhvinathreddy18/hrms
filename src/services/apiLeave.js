import { supabase } from "../lib/supabase";

const SEL =
  "*, employee:employees!leave_requests_employee_id_fkey(id, full_name, email, role, department:departments!employees_department_id_fkey(name)), reviewer:employees!leave_requests_reviewed_by_fkey(id, full_name)";

export async function getLeaveRequests({ status = "", employeeId = "" } = {}) {
  let q = supabase.from("leave_requests").select(SEL).order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  if (employeeId) q = q.eq("employee_id", employeeId);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
}

export async function applyLeave(payload) {
  const { data, error } = await supabase
    .from("leave_requests")
    .insert({ ...payload, status: "pending" })
    .select(SEL)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/** Manager / admin decision. The DB trigger syncs the leave balance. */
export async function reviewLeave({ id, status, comment, reviewerId }) {
  const { data, error } = await supabase
    .from("leave_requests")
    .update({
      status,
      reviewer_comment: comment || null,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(SEL)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function cancelLeave(id) {
  const { error } = await supabase.from("leave_requests").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getLeaveBalances(employeeId) {
  const { data, error } = await supabase
    .from("leave_balances")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("year", new Date().getFullYear())
    .order("ltype");
  if (error) throw new Error(error.message);
  return data;
}
