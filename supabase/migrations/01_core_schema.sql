create extension if not exists "pgcrypto";

do $$ begin create type app_role as enum ('admin','manager','employee');
exception when duplicate_object then null; end $$;
do $$ begin create type leave_type as enum ('sick','casual','paid','unpaid');
exception when duplicate_object then null; end $$;
do $$ begin create type leave_status as enum ('pending','approved','rejected','cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  manager_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  employee_code text unique,
  full_name text not null,
  email text not null unique,
  phone text,
  role app_role not null default 'employee',
  department_id uuid references public.departments(id) on delete set null,
  manager_id uuid references public.employees(id) on delete set null,
  designation text,
  base_salary numeric(12,2) not null default 0,
  join_date date not null default current_date,
  is_active boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.departments drop constraint if exists departments_manager_id_fkey;
alter table public.departments add constraint departments_manager_id_fkey
  foreign key (manager_id) references public.employees(id) on delete set null;

create index if not exists idx_employees_department on public.employees(department_id);
create index if not exists idx_employees_manager on public.employees(manager_id);
create index if not exists idx_employees_user on public.employees(user_id);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  leave_type leave_type not null default 'casual',
  start_date date not null,
  end_date date not null,
  days_count numeric(4,1) not null default 1,
  reason text,
  status leave_status not null default 'pending',
  reviewed_by uuid references public.employees(id) on delete set null,
  reviewer_comment text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leave_dates_valid check (end_date >= start_date)
);
create index if not exists idx_leave_employee on public.leave_requests(employee_id);
create index if not exists idx_leave_status on public.leave_requests(status);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  work_date date not null default current_date,
  check_in timestamptz,
  check_out timestamptz,
  hours_worked numeric(5,2) generated always as (
    case when check_in is not null and check_out is not null
    then round(extract(epoch from (check_out - check_in)) / 3600.0, 2) else null end
  ) stored,
  notes text,
  created_at timestamptz not null default now(),
  unique (employee_id, work_date)
);
create index if not exists idx_attendance_employee_date
  on public.attendance(employee_id, work_date desc);

create table if not exists public.leave_balances (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  year int not null default extract(year from current_date),
  ltype leave_type not null,
  allocated numeric(5,1) not null default 0,
  used numeric(5,1) not null default 0,
  unique (employee_id, year, ltype)
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_employees_touch on public.employees;
create trigger trg_employees_touch before update on public.employees
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_leave_touch on public.leave_requests;
create trigger trg_leave_touch before update on public.leave_requests
  for each row execute function public.touch_updated_at();
