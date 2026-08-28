-- FIX 1 --------------------------------------------------------------
-- An employee could approve their own leave.
-- The old policy verified in USING that the OLD row was pending, but its
-- WITH CHECK only verified ownership, so `set status = 'approved'` passed.
-- USING filters which rows an update can see; WITH CHECK validates the row
-- it becomes. Both halves are needed.
drop policy if exists leave_update_own on public.leave_requests;

create policy leave_update_own on public.leave_requests for update to authenticated
  using  (employee_id = public.current_employee_id() and status = 'pending')
  with check (employee_id = public.current_employee_id()
              and status in ('pending', 'cancelled'));

-- FIX 2 --------------------------------------------------------------
-- No DELETE policy existed for one's own request, so the Withdraw button
-- silently affected zero rows while the UI reported success.
drop policy if exists leave_delete_own on public.leave_requests;

create policy leave_delete_own on public.leave_requests for delete to authenticated
  using (employee_id = public.current_employee_id() and status = 'pending');

-- FIX 3 --------------------------------------------------------------
-- Stamp the reviewer server-side rather than trusting the client payload.
create or replace function public.stamp_leave_review()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.status in ('approved','rejected') and old.status = 'pending' then
    new.reviewed_by = public.current_employee_id();
    new.reviewed_at = now();
  end if;
  return new;
end $$;

drop trigger if exists trg_stamp_review on public.leave_requests;
create trigger trg_stamp_review before update on public.leave_requests
  for each row execute function public.stamp_leave_review();
