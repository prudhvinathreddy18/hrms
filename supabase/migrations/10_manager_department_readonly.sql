-- Managers get read-only visibility into their own department's roster
-- (previously they could only see direct reports via manager_id), and lose
-- the ability to insert new employees — adding employees is admin-only now.

create or replace function public.current_department_id()
returns uuid language sql stable security definer set search_path = public
as $$ select department_id from public.employees where user_id = auth.uid() limit 1 $$;

grant execute on function public.current_department_id() to authenticated;

drop policy if exists emp_select_department_manager on public.employees;
create policy emp_select_department_manager on public.employees for select to authenticated
  using (
    public.current_role() = 'manager'
    and department_id is not null
    and department_id = public.current_department_id()
  );

drop policy if exists emp_insert_manager on public.employees;
