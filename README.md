# HR / Employee Management System

An intermediate-level ERP module built with **React, React Query, React Router and Supabase**.
Role-based access is enforced in Postgres with Row Level Security, not in the client.

---

## Running it

```bash
npm install
cp .env.example .env    # already filled in for your project
npm run dev             # http://localhost:5173
```

The `.env` in this folder is already pointed at your Supabase project
(`qqalaebbodgjxyezhfdq`) with the publishable key. Nothing else to configure —
the schema, policies and seed data are already applied.

### Signing in

Your existing account `muleprudhvinadhreddy2@gmail.com` has been linked to an
employee record with the **admin** role, so it sees every module.

To see the app from an employee's side, sign up with any other email. New
signups land as `employee` and see only their own data. To test the manager
view, open the employee in `/employees/:id` and set their role to `manager`
plus assign them some direct reports.

---

## How roles resolve

`auth.users` and `public.employees` are separate tables joined by a nullable
`user_id`. This is the one place the design departs from the original PRD, and
it matters:

- HR can create an employee record **before** that person has a login
- when they sign up with a matching email, an `on_auth_user_created` trigger
  claims the existing record instead of creating a duplicate
- the first account to sign up is promoted to `admin` to bootstrap the system

Putting the primary key directly on `auth.users.id` (as the PRD sketched) would
have made it impossible to seed the 23 existing employees without first creating
23 auth accounts.

---

## Schema

| Table            | Purpose                                                            |
| ---------------- | ------------------------------------------------------------------ |
| `departments`    | Cost centres, each with an optional manager                        |
| `employees`      | People. Self-referential `manager_id` builds the reporting tree    |
| `leave_requests` | Applications and their approval state                              |
| `attendance`     | One row per employee per day; `hours_worked` is a generated column |
| `leave_balances` | Per employee, per year, per leave type                             |

Your original `public."EMS"` table is untouched. Its 23 rows were copied into
the new schema, departments were normalised (`Fin` → `Finance`), and a manager
was promoted per department.

### Database logic

| Function / trigger       | What it does                                            |
| ------------------------ | ------------------------------------------------------- |
| `handle_new_user()`      | Links a new signup to an employee record                |
| `seed_leave_balances()`  | Grants 12 sick / 12 casual / 15 paid on employee insert |
| `sync_leave_balance()`   | Decrements balance on approval, restores it if reversed |
| `stamp_leave_review()`   | Stamps `reviewed_by` / `reviewed_at` server-side        |
| `payroll_summary(month)` | Computes the payroll table                              |
| `dashboard_stats()`      | Aggregates for the admin dashboard                      |

`payroll_summary` is deliberately `SECURITY INVOKER`: RLS on `employees`
decides whose rows come back. An admin gets everyone, an employee gets exactly
one row, and the client does no filtering. The same RPC powers both
`/payroll` and `/payroll/all`.

---

## RLS

Policies are built on `SECURITY DEFINER` helpers — `current_employee_id()`,
`is_admin()`, `manages_employee()`. These exist specifically so that a policy
_on_ `employees` can query `employees` without infinite recursion, which is the
standard trap when modelling roles this way.

| Table            | Employee                                        | Manager                | Admin |
| ---------------- | ----------------------------------------------- | ---------------------- | ----- |
| `employees`      | read + edit own (name, phone only)              | read direct reports    | full  |
| `leave_requests` | read/create own, edit or withdraw while pending | approve/reject reports | full  |
| `attendance`     | read/write own                                  | read team              | full  |
| `departments`    | read                                            | read                   | full  |
| `leave_balances` | read own                                        | read team              | full  |

### Verified behaviour

These were tested by simulating a session in Postgres
(`set local role authenticated` + a forged JWT claim), not just read off the
policy text:

| Probe                                           | Result                                         |
| ----------------------------------------------- | ---------------------------------------------- |
| Employee sees only their own row in `employees` | 1 row                                          |
| Employee raises their own salary                | blocked (`42501`)                              |
| Employee promotes themselves to admin           | blocked (`42501`)                              |
| Employee edits another person's record          | blocked                                        |
| Employee edits their own name/phone             | allowed                                        |
| Employee approves their own leave               | blocked                                        |
| Employee withdraws their own pending request    | allowed                                        |
| Manager approves a direct report's leave        | allowed, balance decremented, reviewer stamped |
| Employee calls `payroll_summary`                | 1 row (their own)                              |

**Two real bugs were found and fixed during that testing**, both in migration
`hrms_fix_leave_policy_holes`:

1. **Self-approval was possible.** The original `leave_update_own` policy
   checked in `USING` that the _old_ row was pending, but its `WITH CHECK`
   only verified ownership — so an employee could `update ... set status =
'approved'` on their own request. The fix constrains the _new_ status to
   `pending` or `cancelled`, leaving `approved`/`rejected` reachable only
   through the manager and admin policies.

2. **The Withdraw button did nothing.** There was no `DELETE` policy for one's
   own request, so the delete silently affected zero rows and the UI would have
   shown a success toast over a no-op. Added `leave_delete_own`.

A third bug was introduced and caught while refactoring `payroll_summary`
into CTEs: Postgres `LEAST`/`GREATEST` **ignore NULL operands**, so for an
employee with no matching leave row the left join evaluated
`least(NULL, m_end) - greatest(NULL, m_start) + 1` to a full month. Every
employee briefly showed 31 unpaid days and negative net pay. The fix guards
the sum with `case when lr.id is null then 0`.

The first is the more instructive one: `USING` filters which existing rows an
update can _see_, while `WITH CHECK` validates the row it _becomes_. Getting
only the first half right is a common and quiet mistake.

---

## Routes

```
/login  /signup

/dashboard              role-aware

/leave                  apply, view own history, withdraw
/attendance             check in/out, muster strip, daily log
/payroll                own payslip
/profile                editable name and phone

/leave/approvals        manager + admin
/attendance/team        manager + admin

/employees              admin
/employees/:id          admin
/departments            admin
/payroll/all            admin, with CSV export
```

Role gating is a `<ProtectedRoute roles={[...]}>` wrapper. It's a convenience,
not the security boundary — RLS is. Removing the wrapper would expose the page
shell but return no data.

---

## React Query notes

- Query key factories (`employeeKeys`, `leaveKeys`, `attKeys`) keep
  invalidation predictable as the surface grows
- `useReviewLeave` does an **optimistic update**: the row flips state instantly
  and rolls back from a snapshot if the server or a policy rejects the write.
  Because the self-approval hole is now closed, an employee attempting it sees
  the row revert — a good demonstration of optimistic UI meeting a real
  server-side rule.
- `placeholderData: (prev) => prev` on filtered lists keeps the table on screen
  while a new filter loads instead of flashing a spinner
- The devtools panel is enabled in development

---

## Things deliberately left out

Real payroll (tax, PF, statutory compliance), email notifications, file uploads,
and realtime subscriptions. The payroll page states its own limits in the UI so
nobody mistakes the number for a payable figure.

## Suggested next steps

1. Add Supabase Realtime on `leave_requests` so approvals appear live
2. Email on approve/reject via an Edge Function
3. A holiday calendar so `payroll_summary` excludes public holidays rather than
   just weekends
4. Move `days_count` from a client-supplied value to a generated column — right
   now a crafted request could claim fewer days than the date range implies
