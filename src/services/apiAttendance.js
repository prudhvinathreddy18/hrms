import { supabase } from "../lib/supabase";
import { todayISO } from "../lib/format";

export async function getTodayAttendance(employeeId) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("work_date", todayISO())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getMyAttendance({ employeeId, from, to }) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", employeeId)
    .gte("work_date", from)
    .lte("work_date", to)
    .order("work_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getTeamAttendance({ date }) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*, employee:employees(id, full_name, email, department:departments!employees_department_id_fkey(name))")
    .eq("work_date", date)
    .order("check_in");
  if (error) throw new Error(error.message);
  return data;
}

export async function checkIn(employeeId) {
  const { data, error } = await supabase
    .from("attendance")
    .upsert(
      { employee_id: employeeId, work_date: todayISO(), check_in: new Date().toISOString() },
      { onConflict: "employee_id,work_date" }
    )
    .select("*, employee:employees(full_name)")
    .single();
  if (error) throw new Error(error.message);

  supabase.functions.invoke("notify-hr", {
    body: {
      subject: `Check-in: ${data.employee.full_name}`,
      html: `<p><b>${data.employee.full_name}</b> checked in at ${new Date(data.check_in).toLocaleTimeString()}.</p>`,
    },
  }); // fire-and-forget, don't block the UI on email delivery

  return data;
}

export async function checkOut(id) {
  const { data, error } = await supabase
    .from("attendance")
    .update({ check_out: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
