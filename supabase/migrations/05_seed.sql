-- Carries the legacy public."EMS" table into the normalised schema.
-- Skip this file on a fresh project that has no "EMS" table.

insert into public.departments (name)
select distinct case when trim("Department") = 'Fin' then 'Finance' else trim("Department") end
from public."EMS"
where "Department" is not null and trim("Department") <> ''
on conflict (name) do nothing;

insert into public.employees
  (employee_code, full_name, email, department_id, base_salary, designation, join_date)
select 'EMP-' || lpad(x."Emp_ID"::text, 4, '0'),
       x."Emp_Name", lower(x."Emp_Mail"), d.id,
       -- a few legacy rows had salary entered at the wrong magnitude
       case when x."Salaray" < 50000 then x."Salaray" * 100 else x."Salaray" end,
       'Associate',
       current_date - (interval '1 day' * (random() * 900)::int)
from public."EMS" x
left join public.departments d
  on d.name = case when trim(x."Department") = 'Fin' then 'Finance' else trim(x."Department") end
where x."Emp_Name" is not null and x."Emp_Mail" is not null
on conflict (email) do nothing;

-- promote the highest paid person per department to manager, then wire reporting lines
with picks as (
  select distinct on (department_id) id, department_id
  from public.employees where department_id is not null
  order by department_id, base_salary desc
)
update public.employees e set role = 'manager', designation = 'Department Manager'
  from picks p where e.id = p.id;

update public.departments d set manager_id = e.id
  from public.employees e where e.department_id = d.id and e.role = 'manager';

update public.employees e set manager_id = d.manager_id
  from public.departments d
 where e.department_id = d.id and e.role = 'employee' and d.manager_id is not null;

-- demo attendance, last 30 weekdays at roughly 85% turnout
insert into public.attendance (employee_id, work_date, check_in, check_out)
select e.id, d::date,
       d::date + time '09:30' + (interval '1 minute' * (random()*45)::int),
       d::date + time '18:15' + (interval '1 minute' * (random()*60)::int)
from public.employees e
cross join generate_series(current_date - interval '30 days', current_date - interval '1 day', interval '1 day') d
where extract(isodow from d) < 6 and random() < 0.85
on conflict (employee_id, work_date) do nothing;

-- demo leave requests across mixed states
insert into public.leave_requests
  (employee_id, leave_type, start_date, end_date, days_count, reason, status, reviewed_by, reviewed_at)
select e.id, v.ltype, v.sd, v.sd + (v.len - 1), v.len, v.reason, v.status,
       case when v.status = 'pending' then null else e.manager_id end,
       case when v.status = 'pending' then null else now() - interval '2 days' end
from public.employees e
cross join lateral (
  select (array['sick','casual','paid','unpaid']::leave_type[])[1 + floor(random()*4)] as ltype,
         (current_date + ((floor(random()*40) - 20)::int))::date as sd,
         (1 + floor(random()*3))::int as len,
         (array['pending','approved','rejected']::leave_status[])[1 + floor(random()*3)] as status,
         (array['Family function out of town','Down with fever','Personal errand',
                'Extended weekend trip','Medical appointment'])[1 + floor(random()*5)] as reason
) v
where random() < 0.75;
