-- Managers could see their department roster (10_manager_department_readonly.sql)
-- but not the row of whoever those employees report to when that person sits
-- in a different department, so the "Reports to" column came back empty.
-- Give managers read access to any employee referenced as manager_id by
-- someone in their own department.

drop policy if exists emp_select_reports_to on public.employees;
create policy emp_select_reports_to on public.employees for select to authenticated
  using (
    public.current_role() = 'manager'
    and id in (
      select manager_id from public.employees
      where department_id = public.current_department_id()
        and manager_id is not null
    )
  );
