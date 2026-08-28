import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLeaveRequests, useLeaveBalances, useApplyLeave, useCancelLeave } from "../hooks/useLeave";
import { Badge, Empty, Field, Modal, Spinner, ErrorBox } from "../ui/Bits";
import { dateOnly, dayCount, todayISO } from "../lib/format";

const TYPES = ["casual", "sick", "paid", "unpaid"];

export default function Leave() {
  const { employee, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const { data, isLoading, error } = useLeaveRequests({ employeeId: employee?.id });
  const { data: balances } = useLeaveBalances(employee?.id);
  const cancel = useCancelLeave();

  if (isAdmin) return <Navigate to="/leave/approvals" replace />;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">My record</div>
          <h1>Leave</h1>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            <Plus size={15} /> Apply for leave
          </button>
        </div>
      </div>

      {balances?.length > 0 && (
        <div className="grid g3" style={{ marginBottom: 16 }}>
          {balances.map((b) => {
            const left = Number(b.allocated) - Number(b.used);
            const pct = b.allocated ? (left / b.allocated) * 100 : 0;
            return (
              <div className="stat" key={b.id}>
                <div className="k">{b.ltype} leave</div>
                <div className="v">{left}</div>
                <div className="s">of {b.allocated} days remaining</div>
                <div className="bar" style={{ marginTop: 10 }}>
                  <i className={pct === 0 ? "none" : pct < 34 ? "low" : ""} style={{ width: `${Math.max(pct, 2)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card">
        <div className="card-head"><h2>Request history</h2></div>
        {error ? (
          <ErrorBox error={error} />
        ) : isLoading ? (
          <Spinner />
        ) : !data?.length ? (
          <Empty title="Nothing on file">Apply for leave and it will show up here with its status.</Empty>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th className="num">Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Reviewed by</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id}>
                    <td style={{ textTransform: "capitalize", fontWeight: 600 }}>{r.leave_type}</td>
                    <td className="mono small">{dateOnly(r.start_date)} → {dateOnly(r.end_date)}</td>
                    <td className="num">{r.days_count}</td>
                    <td className="small muted" style={{ maxWidth: 220 }}>{r.reason || "—"}</td>
                    <td>
                      <Badge kind={r.status}>{r.status}</Badge>
                      {r.reviewer_comment && (
                        <div className="small dim" style={{ marginTop: 3 }}>{r.reviewer_comment}</div>
                      )}
                    </td>
                    <td className="small dim">{r.reviewer?.full_name ?? "—"}</td>
                    <td>
                      {r.status === "pending" && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => cancel.mutate(r.id)}
                          disabled={cancel.isPending}
                        >
                          <Trash2 size={13} /> Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && <ApplyModal employee={employee} onClose={() => setOpen(false)} />}
    </>
  );
}

function ApplyModal({ employee, onClose }) {
  const [form, setForm] = useState({
    leave_type: "casual",
    start_date: todayISO(),
    end_date: todayISO(),
    reason: "",
  });
  const apply = useApplyLeave();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const days =
    form.start_date && form.end_date && form.end_date >= form.start_date
      ? dayCount(form.start_date, form.end_date)
      : 0;

  function submit(e) {
    e.preventDefault();
    apply.mutate(
      { ...form, employee_id: employee.id, days_count: days },
      { onSuccess: onClose }
    );
  }

  return (
    <Modal title="Apply for leave" subtitle="Your manager will see this in their approvals queue." onClose={onClose}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Leave type">
          <select className="select" value={form.leave_type} onChange={set("leave_type")}>
            {TYPES.map((t) => (
              <option key={t} value={t} style={{ textTransform: "capitalize" }}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid g2" style={{ gap: 12 }}>
          <Field label="From">
            <input className="input" type="date" value={form.start_date} onChange={set("start_date")} />
          </Field>
          <Field label="To">
            <input className="input" type="date" min={form.start_date} value={form.end_date} onChange={set("end_date")} />
          </Field>
        </div>

        <div className="small mono dim">
          {days > 0 ? `${days} calendar day${days > 1 ? "s" : ""}` : "Pick an end date on or after the start date"}
        </div>

        <Field label="Reason">
          <textarea className="textarea" value={form.reason} onChange={set("reason")} placeholder="A line on why you'll be away" />
        </Field>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={apply.isPending || days < 1}>
            {apply.isPending ? "Submitting…" : "Submit request"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
