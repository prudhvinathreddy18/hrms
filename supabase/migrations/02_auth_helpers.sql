-- SECURITY DEFINER so policies on `employees` don't recurse on themselves.
create or replace function public.current_employee_id()
returns uuid language sql stable security definer set search_path = public
as $$ select id from public.employees where user_id = auth.uid() limit 1 $$;

create or replace function public.current_role()
returns app_role language sql stable security definer set search_path = public
as $$ select role from public.employees where user_id = auth.uid() limit 1 $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce((select role from public.employees where user_id = auth.uid() limit 1) = 'admin', false) $$;

create or replace function public.is_manager_or_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce((select role from public.employees where user_id = auth.uid() limit 1)
                      in ('admin','manager'), false) $$;

create or replace function public.manages_employee(target uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (
  select 1 from public.employees e
  where e.id = target
    and e.manager_id = (select id from public.employees where user_id = auth.uid() limit 1)) $$;

grant execute on function public.current_employee_id() to authenticated;
grant execute on function public.current_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_manager_or_admin() to authenticated;
grant execute on function public.manages_employee(uuid) to authenticated;

-- Link a new signup to an employee record. First user becomes admin.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare existing_id uuid; first_user boolean;
begin
  select id into existing_id from public.employees
   where lower(email) = lower(new.email) and user_id is null limit 1;
  select not exists (select 1 from public.employees where user_id is not null) into first_user;

  if existing_id is not null then
    update public.employees
       set user_id = new.id,
           role = case when first_user then 'admin'::app_role else role end
     where id = existing_id;
  else
    insert into public.employees (user_id, full_name, email, role, base_salary)
    values (new.id,
            coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
            new.email,
            case when first_user then 'admin'::app_role else 'employee'::app_role end,
            0);
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.seed_leave_balances()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.leave_balances (employee_id, year, ltype, allocated)
  values (new.id, extract(year from current_date)::int, 'sick', 12),
         (new.id, extract(year from current_date)::int, 'casual', 12),
         (new.id, extract(year from current_date)::int, 'paid', 15)
  on conflict (employee_id, year, ltype) do nothing;
  return new;
end $$;

drop trigger if exists trg_seed_balances on public.employees;
create trigger trg_seed_balances after insert on public.employees
  for each row execute function public.seed_leave_balances();

create or replace function public.sync_leave_balance()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.status = 'approved' and old.status <> 'approved' then
    update public.leave_balances set used = used + new.days_count
     where employee_id = new.employee_id and ltype = new.leave_type
       and year = extract(year from new.start_date)::int;
  elsif old.status = 'approved' and new.status <> 'approved' then
    update public.leave_balances set used = greatest(used - new.days_count, 0)
     where employee_id = new.employee_id and ltype = new.leave_type
       and year = extract(year from new.start_date)::int;
  end if;
  return new;
end $$;

drop trigger if exists trg_sync_balance on public.leave_requests;
create trigger trg_sync_balance after update on public.leave_requests
  for each row execute function public.sync_leave_balance();
