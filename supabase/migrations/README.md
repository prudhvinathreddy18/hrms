# Migrations

These are already applied to project `qqalaebbodgjxyezhfdq`. They're kept here
so the schema is reproducible on a fresh project.

Apply in filename order via the Supabase SQL editor, or `supabase db push`
if you're using the CLI.

| File | Contents |
|---|---|
| `01_core_schema.sql` | Enums, tables, indexes, updated_at trigger |
| `02_auth_helpers.sql` | SECURITY DEFINER helpers, signup linking, balance triggers |
| `03_rls_policies.sql` | Row Level Security on all five tables |
| `04_payroll_stats.sql` | `payroll_summary()` and `dashboard_stats()` |
| `05_seed.sql` | Departments + employees from the legacy `EMS` table, demo activity |
| `06_fix_leave_holes.sql` | Closes self-approval, adds the missing DELETE policy |

Note that `05_seed.sql` reads from `public."EMS"`. On a fresh project without
that table, skip it and add employees through the UI instead.
