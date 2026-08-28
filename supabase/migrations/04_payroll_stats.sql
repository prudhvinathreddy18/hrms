-- NOTE: LEAST/GREATEST ignore NULL operands in Postgres. Without the
-- `case when lr.id is null` guard below, an employee with no matching leave
-- row gets least(NULL, m_end) - greatest(NULL, m_start) + 1 = a full month,
-- which silently produced negative net pay for everyone.
-- SECURITY INVOKER on purpose: RLS on `employees` decides whose rows come
-- back, so admin gets everyone and an employee gets exactly one row.
create or replace function public.payroll_summary(p_month date)
returns table (
  employee_id uuid, full_name text, designation text, department text,
  base_salary numeric, working_days int, present_days int,
  paid_leave_days numeric, unpaid_leave_days numeric,
  per_day_rate numeric, deductions numeric, net_pay numeric
) language sql stable as $$
with bounds as (
  select date_trunc('month', p_month)::date as m_start,
         (date_trunc('month', p_month) + interval '1 month - 1 day')::date as m_end
),
wd as (
  select count(*)::int as working_days
  from bounds b, generate_series(b.m_start, b.m_end, interval '1 day') d
  where extract(isodow from d) < 6
),
unpaid as (
  select e.id as eid, coalesce(sum(
    case when lr.id is null then 0
         else (least(lr.end_date, b.m_end) - greatest(lr.start_date, b.m_start) + 1)::numeric
    end), 0) as days
  from public.employees e
  cross join bounds b
  left join public.leave_requests lr
    on lr.employee_id = e.id and lr.status = 'approved' and lr.leave_type = 'unpaid'
   and lr.start_date <= b.m_end and lr.end_date >= b.m_start
  group by e.id
),
paid as (
  select e.id as eid, coalesce(sum(
    case when lr.id is null then 0
         else (least(lr.end_date, b.m_end) - greatest(lr.start_date, b.m_start) + 1)::numeric
    end), 0) as days
  from public.employees e
  cross join bounds b
  left join public.leave_requests lr
    on lr.employee_id = e.id and lr.status = 'approved' and lr.leave_type <> 'unpaid'
   and lr.start_date <= b.m_end and lr.end_date >= b.m_start
  group by e.id
),
present as (
  select e.id as eid, count(distinct a.work_date)::int as days
  from public.employees e
  cross join bounds b
  left join public.attendance a
    on a.employee_id = e.id and a.work_date between b.m_start and b.m_end
   and a.check_in is not null
  group by e.id
)
select e.id, e.full_name, e.designation, d.name, e.base_salary,
       wd.working_days, present.days, paid.days, unpaid.days,
       round(e.base_salary / nullif(wd.working_days, 0), 2),
       round(unpaid.days * (e.base_salary / nullif(wd.working_days, 0)), 2),
       round(e.base_salary - unpaid.days * (e.base_salary / nullif(wd.working_days, 0)), 2)
from public.employees e
cross join wd
left join public.departments d on d.id = e.department_id
left join unpaid  on unpaid.eid  = e.id
left join paid    on paid.eid    = e.id
left join present on present.eid = e.id
where e.is_active
order by e.full_name;
$$;

grant execute on function public.payroll_summary(date) to authenticated;

create or replace function public.dashboard_stats()
returns json language sql stable as $$
  select json_build_object(
    'total_employees',  (select count(*) from public.employees where is_active),
    'total_departments',(select count(*) from public.departments),
    'pending_leaves',   (select count(*) from public.leave_requests where status = 'pending'),
    'present_today',    (select count(*) from public.attendance
                          where work_date = current_date and check_in is not null),
    'by_department',    (select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
                          select d.name as department, count(e.id) as count
                          from public.departments d
                          left join public.employees e on e.department_id = d.id and e.is_active
                          group by d.name order by count(e.id) desc) t));
$$;

grant execute on function public.dashboard_stats() to authenticated;
