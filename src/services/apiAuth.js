import { supabase } from "../lib/supabase";

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signup({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/** The signed-in user's own employee record, with department joined. */
export async function getMyEmployee() {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session) return null;

  const { data, error } = await supabase
    .from("employees")
    .select("*, department:departments!employees_department_id_fkey(id, name)")
    .eq("user_id", session.session.user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
