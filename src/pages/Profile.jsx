import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useUpdateEmployee } from "../hooks/useEmployees";
import { Badge, Field, Spinner } from "../ui/Bits";
import { money, dateOnly } from "../lib/format";

export default function Profile() {
  const { employee, refreshEmployee, session } = useAuth();
  const update = useUpdateEmployee();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (employee) setForm({ full_name: employee.full_name, phone: employee.phone ?? "" });
  }, [employee]);

  if (!form) return <Spinner />;

  function save(e) {
    e.preventDefault();
    update.mutate({ id: employee.id, ...form }, { onSuccess: refreshEmployee });
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">My record</div>
          <h1>Profile</h1>
        </div>
      </div>

      <div className="grid g2" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
        <div className="card">
          <div className="card-head"><h2>Details you can change</h2></div>
          <div className="card-body">
            <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Full name">
                <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </Field>
              <Field label="Phone">
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Optional" />
              </Field>
              <p className="small dim">
                Role, salary and department are set by HR. Row level security blocks
                changes to those fields from this page, even if the request is forged.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn btn-primary" disabled={update.isPending}>
                  {update.isPending ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h2>Set by HR</h2></div>
          <div className="card-body">
            <div className="row" style={{ gap: 14, marginBottom: 18 }}>

              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{employee.full_name}</div>
                <div className="small dim">{session?.user?.email}</div>
              </div>
            </div>

            <Row label="Employee code" value={employee.employee_code ?? "—"} mono />
            <Row label="Role" value={<Badge kind={employee.role}>{employee.role}</Badge>} />
            <Row label="Department" value={employee.department?.name ?? "—"} />
            <Row label="Designation" value={employee.designation ?? "—"} />
            <Row label="Annual salary" value={money(employee.base_salary)} mono />
            <Row label="Joined" value={dateOnly(employee.join_date)} mono />
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--line-2)" }}>
      <span className="small muted">{label}</span>
      <span className={mono ? "mono" : ""} style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
