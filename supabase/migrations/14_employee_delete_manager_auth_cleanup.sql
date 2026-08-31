-- Managers previously had no DELETE policy on employees, so clicking
-- "Delete" from a manager login silently failed RLS and the row (and its
-- auth login) stuck around. Let a manager delete employees who report to
-- them directly; admins already have full access via emp_admin_all.
drop policy if exists emp_delete_manager on public.employees;
create policy emp_delete_manager on public.employees for delete to authenticated
  using (public.manages_employee(id) and role = 'employee');

-- When an employee row is deleted, remove their Supabase auth login too so
-- they can no longer sign in. auth.users cascades to auth.sessions,
-- auth.refresh_tokens and auth.identities, which kills any active session.
create or replace function public.handle_employee_deleted()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if old.user_id is not null then
    delete from auth.users where id = old.user_id;
  end if;
  return old;
end;
$$;

drop trigger if exists trg_employees_delete_auth on public.employees;
create trigger trg_employees_delete_auth
  after delete on public.employees
  for each row execute function public.handle_employee_deleted();
