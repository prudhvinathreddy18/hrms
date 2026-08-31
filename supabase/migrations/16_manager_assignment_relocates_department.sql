-- Assigning someone as a department's manager should move them into that
-- department too, not just mark them as its head while they stay wherever
-- they were. Previously only role/reports-to were synced, so a manager
-- assigned to a department other than their own showed their old
-- department on their own row, which read as broken.
create or replace function public.sync_department_manager()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.manager_id is not distinct from old.manager_id then
    return new;
  end if;

  -- Promote the newly assigned manager (if needed) and relocate them into
  -- the department they now head.
  if new.manager_id is not null then
    update public.employees
    set role = 'manager',
        department_id = new.id
    where id = new.manager_id;
  end if;

  -- Point every other employee in this department at the new manager
  -- (or clear "Reports To" if the department no longer has a manager).
  update public.employees
  set manager_id = new.manager_id
  where department_id = new.id
    and (new.manager_id is null or id <> new.manager_id);

  -- Demote the outgoing manager back to 'employee' if they no longer
  -- manage any other department.
  if old.manager_id is not null
     and old.manager_id is distinct from new.manager_id then
    update public.employees
    set role = 'employee'
    where id = old.manager_id
      and role = 'manager'
      and not exists (
        select 1 from public.departments d
        where d.manager_id = old.manager_id and d.id <> new.id
      );
  end if;

  return new;
end $$;
