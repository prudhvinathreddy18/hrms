import { supabase } from "../lib/supabase";

export async function getDashboardStats() {
  const { data, error } = await supabase.rpc("dashboard_stats");
  if (error) throw new Error(error.message);
  return data;
}
