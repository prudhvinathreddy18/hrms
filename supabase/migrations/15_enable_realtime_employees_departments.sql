-- Push live changes to connected clients (e.g. an admin edit shows up in an
-- already-open manager screen) instead of relying on tab refocus/reload.
-- RLS still applies: Realtime only broadcasts rows a given client is allowed
-- to select, so a manager only gets events for their own department's rows.
alter publication supabase_realtime add table public.employees;
alter publication supabase_realtime add table public.departments;
