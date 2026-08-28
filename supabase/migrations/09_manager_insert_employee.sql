-- Managers can add new employees from the Employees page, but the UI only
-- ever lets them create plain "employee" rows (Role select has one option).
-- No INSERT policy previously existed for non-admins, so that form always
-- failed RLS with "new row violates row-level security policy".
drop policy if exists emp_insert_manager on public.employees;
create policy emp_insert_manager on public.employees for insert to authenticated
  with check (public.current_role() = 'manager' and role = 'employee');
