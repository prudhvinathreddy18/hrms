-- 12_manager_visibility_reports_to.sql caused "infinite recursion detected in
-- policy for relation employees": its policy queried public.employees
-- directly inside a USING clause on public.employees itself. Route the
-- lookup through a security definer function instead, matching the pattern
-- used by current_department_id() / manages_employee() elsewhere.

drop policy if exists emp_select_reports_to on public.employees;

create or replace function public.is_manager_of_department_report(target_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.employees e
    where e.manager_id = target_id
      and e.department_id = public.current_department_id()
  )
$$;

grant execute on function public.is_manager_of_department_report(uuid) to authenticated;

create policy emp_select_reports_to on public.employees for select to authenticated
  using (
    public.current_role() = 'manager'
    and public.is_manager_of_department_report(id)
  );
