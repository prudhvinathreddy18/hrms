import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserX } from "lucide-react";
import { subDays, format } from "date-fns";
import {
  useEmployee,
  useUpdateEmployee,
  useDeactivateEmployee,
} from "../hooks/useEmployees";
import { useDepartments } from "../hooks/useDepartments";
import { useMyAttendance } from "../hooks/useAttendance";
import { useLeaveRequests, useLeaveBalances } from "../hooks/useLeave";
import { Badge, Field, Spinner, ErrorBox, Empty, Stat } from "../ui/Bits";
import { money, dateOnly, todayISO } from "../lib/format";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: emp, isLoading, error } = useEmployee(id);
  const { data: departments } = useDepartments();
  const update = useUpdateEmployee();
  const deactivate = useDeactivateEmployee();

  const [form, setForm] = useState(null);
  useEffect(() => {
    if (emp)
      setForm({
        designation: emp.designation ?? "",
        department_id: emp.department_id ?? "",
        manager_id: emp.manager_id ?? "",
        role: emp.role,
        base_salary: emp.base_salary ?? 0,
        phone: emp.phone ?? "",
        join_date: emp.join_date ?? todayISO(),
      });
  }, [emp]);

  const from = subDays(new Date(), 27);
  const { data: att } = useMyAttendance(
    id,
    format(from, "yyyy-MM-dd"),
    todayISO(),
  );
  const { data: leaves } = useLeaveRequests({ employeeId: id });
  const { data: balances } = useLeaveBalances(id);

  if (isLoading || !form) return <Spinner />;
  if (error) return <ErrorBox error={error} />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const selectedDept = departments?.find(
    (d) => String(d.id) === String(form.department_id),
  );
  const deptManager =
    selectedDept?.manager && String(selectedDept.manager.id) !== String(id)
      ? selectedDept.manager
      : null;

  function setDepartment(e) {
    const department_id = e.target.value;
    const dept = departments?.find((d) => String(d.id) === department_id);
    const manager =
      dept?.manager && String(dept.manager.id) !== String(id)
        ? dept.manager
        : null;
    setForm({
      ...form,
      department_id,
      manager_id:
        form.role === "manager" || form.role === "admin"
          ? ""
          : manager?.id ?? "",
    });
  }

  function save(e) {
    e.preventDefault();
    const payload = {
      ...form,
      manager_id:
        form.role === "manager" || form.role === "admin"
          ? null
          : form.manager_id || null,
    };
    update.mutate({ id, ...payload });
  }

  const pendingCount = (leaves ?? []).filter(
    (l) => l.status === "pending",
  ).length;
  const daysPresent = (att ?? []).filter((a) => a.check_in).length;

  return (
    <>
      <div className="page-head">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("/employees")}
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div className="row" style={{ gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1>{emp.full_name}</h1>
              <div className="row small dim" style={{ gap: 12, marginTop: 4 }}>
                <span className="mono">{emp.employee_code ?? "—"}</span>
                <span>{emp.email}</span>
                <span>{emp.department?.name ?? "No department"}</span>
              </div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <Badge kind={emp.role}>{emp.role}</Badge>
              {!emp.is_active && <Badge kind="rejected">Inactive</Badge>}
              {emp.user_id ? (
                <Badge kind="approved">Login linked</Badge>
              ) : (
                <Badge>No login yet</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid g4" style={{ marginBottom: 16 }}>
        <Stat
          label="Annual salary"
          value={money(emp.base_salary)}
          sub="Base, before deductions"
        />
        <Stat label="Days present" value={daysPresent} sub="Last four weeks" />
        <Stat
          label="Leave requests"
          value={leaves?.length ?? 0}
          sub={`${pendingCount} pending`}
        />
        <Stat
          label="Joined"
          value={dateOnly(emp.join_date)}
          sub={emp.designation ?? "—"}
        />
      </div>

      <div
        className="grid g2"
        style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 16 }}
      >
        <div className="card">
          <div className="card-head">
            <h2>Employment details</h2>
          </div>
          <div className="card-body">
            <form
              onSubmit={save}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div className="grid g2" style={{ gap: 12 }}>
                <Field label="Designation">
                  <input
                    className="input"
                    value={form.designation}
                    onChange={set("designation")}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    className="input"
                    value={form.phone}
                    onChange={set("phone")}
                  />
                </Field>
              </div>

              <div className="grid g2" style={{ gap: 12 }}>
                <Field label="Department">
                  <select
                    id="Department"
                    className="select"
                    value={form.department_id}
                    onChange={setDepartment}
                  >
                    <option value="">Unassigned</option>
                    {departments?.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Reports to">
                  {form.role === "manager" ? (
                    <input className="input" disabled value="Admin" />
                  ) : form.role === "admin" ? (
                    <input className="input" disabled value="—" />
                  ) : (
                    <select
                      className="select"
                      value={form.manager_id}
                      onChange={set("manager_id")}
                    >
                      <option value="">No manager assigned</option>
                      {deptManager && (
                        <option value={deptManager.id}>
                          {deptManager.full_name}
                        </option>
                      )}
                    </select>
                  )}
                </Field>
              </div>

              <div className="grid g2" style={{ gap: 12 }}>
                <Field label="Role">
                  <select
                    className="select"
                    value={form.role}
                    onChange={set("role")}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </Field>
                <Field label="Annual salary">
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.base_salary}
                    onChange={set("base_salary")}
                  />
                </Field>
              </div>

              <Field label="Joining date">
                <input
                  className="input"
                  type="date"
                  value={form.join_date}
                  onChange={set("join_date")}
                />
              </Field>

              <div className="row" style={{ justifyContent: "space-between" }}>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (
                      confirm(
                        `Deactivate ${emp.full_name}? They'll be hidden from active lists.`,
                      )
                    )
                      deactivate.mutate(id, {
                        onSuccess: () => navigate("/employees"),
                      });
                  }}
                >
                  <UserX size={14} /> Deactivate
                </button>
                <button className="btn btn-primary" disabled={update.isPending}>
                  {update.isPending ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Leave balance</h2>
          </div>
          <div className="card-body">
            {!balances?.length ? (
              <Empty title="No allocation">
                Nothing is allotted for this year.
              </Empty>
            ) : (
              balances.map((b) => {
                const left = Number(b.allocated) - Number(b.used);
                const pct = b.allocated ? (left / b.allocated) * 100 : 0;
                return (
                  <div className="bal" key={b.id}>
                    <div className="bal-top">
                      <span className="bal-name">{b.ltype}</span>
                      <span className="bal-num">
                        {left} of {b.allocated} left
                      </span>
                    </div>
                    <div className="bar">
                      <i
                        className={pct === 0 ? "none" : pct < 34 ? "low" : ""}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
