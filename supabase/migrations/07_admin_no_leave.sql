-- Admins manage approvals only; they don't file their own leave requests.
drop policy if exists leave_insert_own on public.leave_requests;

create policy leave_insert_own on public.leave_requests for insert to authenticated
  with check (employee_id = public.current_employee_id()
              and status = 'pending'
              and public.current_role() <> 'admin');
