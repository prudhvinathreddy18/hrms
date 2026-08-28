alter table public.departments enable row level security;
alter table public.employees enable row level security;
alter table public.leave_requests enable row level security;
alter table public.attendance enable row level security;
alter table public.leave_balances enable row level security;

-- DEPARTMENTS
drop policy if exists dept_read on public.departments;
drop policy if exists dept_admin_all on public.departments;
create policy dept_read on public.departments for select to authenticated using (true);
create policy dept_admin_all on public.departments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- EMPLOYEES
drop policy if exists emp_select_own on public.employees;
drop policy if exists emp_update_own on public.employees;
drop policy if exists emp_admin_all on public.employees;

create policy emp_select_own on public.employees for select to authenticated
  using (user_id = auth.uid() or public.is_admin()
         or manager_id = public.current_employee_id());

-- role and salary must be unchanged, so an employee cannot promote or pay themselves
create policy emp_update_own on public.employees for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid()
    and role = (select role from public.employees where user_id = auth.uid())
    and base_salary = (select base_salary from public.employees where user_id = auth.uid()));

create policy emp_admin_all on public.employees for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- LEAVE REQUESTS
drop policy if exists leave_select on public.leave_requests;
drop policy if exists leave_insert_own on public.leave_requests;
drop policy if exists leave_update_own on public.leave_requests;
drop policy if exists leave_review on public.leave_requests;
drop policy if exists leave_admin_all on public.leave_requests;

create policy leave_select on public.leave_requests for select to authenticated
  using (employee_id = public.current_employee_id() or public.is_admin()
         or public.manages_employee(employee_id));

create policy leave_insert_own on public.leave_requests for insert to authenticated
  with check (employee_id = public.current_employee_id() and status = 'pending');

-- NOTE: superseded by 06_fix_leave_holes.sql
create policy leave_update_own on public.leave_requests for update to authenticated
  using (employee_id = public.current_employee_id() and status = 'pending')
  with check (employee_id = public.current_employee_id());

create policy leave_review on public.leave_requests for update to authenticated
  using (public.manages_employee(employee_id))
  with check (public.manages_employee(employee_id));

create policy leave_admin_all on public.leave_requests for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ATTENDANCE
drop policy if exists att_select on public.attendance;
drop policy if exists att_insert_own on public.attendance;
drop policy if exists att_update_own on public.attendance;
drop policy if exists att_admin_all on public.attendance;

create policy att_select on public.attendance for select to authenticated
  using (employee_id = public.current_employee_id() or public.is_admin()
         or public.manages_employee(employee_id));
create policy att_insert_own on public.attendance for insert to authenticated
  with check (employee_id = public.current_employee_id());
create policy att_update_own on public.attendance for update to authenticated
  using (employee_id = public.current_employee_id())
  with check (employee_id = public.current_employee_id());
create policy att_admin_all on public.attendance for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- LEAVE BALANCES
drop policy if exists bal_select on public.leave_balances;
drop policy if exists bal_admin_all on public.leave_balances;
create policy bal_select on public.leave_balances for select to authenticated
  using (employee_id = public.current_employee_id() or public.is_admin()
         or public.manages_employee(employee_id));
create policy bal_admin_all on public.leave_balances for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
