-- A manager's own leave must be approved by an admin, never by another
-- manager (even if manager_id happens to point at one). Admins already
-- bypass this via leave_admin_all.
drop policy if exists leave_review on public.leave_requests;

create policy leave_review on public.leave_requests for update to authenticated
  using (public.manages_employee(employee_id)
         and (select role from public.employees where id = employee_id) = 'employee')
  with check (public.manages_employee(employee_id)
              and (select role from public.employees where id = employee_id) = 'employee');
