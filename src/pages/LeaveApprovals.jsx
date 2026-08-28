import { useState } from "react";
import { Check, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLeaveRequests, useReviewLeave } from "../hooks/useLeave";
import { Badge, Empty, Modal, Person, Spinner, ErrorBox, Field } from "../ui/Bits";
import { dateOnly } from "../lib/format";

export default function LeaveApprovals() {
  const { employee, isAdmin } = useAuth();
  const [status, setStatus] = useState("pending");
  const [decision, setDecision] = useState(null);
  const { data, isLoading, error } = useLeaveRequests({ status });
  const review = useReviewLeave();

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Team</div>
          <h1>Leave approvals</h1>
        </div>
        <div className="actions">
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 160 }}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All requests</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>{status ? `${status[0].toUpperCase()}${status.slice(1)} requests` : "All requests"}</h2>
          <div className="actions">
            <span className="mono small dim">{data?.length ?? 0} rows</span>
          </div>
        </div>

        {error ? (
          <ErrorBox error={error} />
        ) : isLoading ? (
          <Spinner />
        ) : !data?.length ? (
          <Empty title="Queue is clear">
            {status === "pending"
              ? "No requests are waiting for a decision right now."
              : "Nothing matches this filter."}
          </Empty>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th className="num">Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Person
                        name={r.employee?.full_name ?? "Unknown"}
                        sub={r.employee?.department?.name ?? "No department"}
                      />
                    </td>
                    <td style={{ textTransform: "capitalize", fontWeight: 600 }}>{r.leave_type}</td>
                    <td className="mono small">{dateOnly(r.start_date)} → {dateOnly(r.end_date)}</td>
                    <td className="num">{r.days_count}</td>
                    <td className="small muted" style={{ maxWidth: 200 }}>{r.reason || "—"}</td>
                    <td><Badge kind={r.status}>{r.status}</Badge></td>
                    <td>
                      {r.status === "pending" && (isAdmin || r.employee?.role !== "manager") && (
                        <div className="row" style={{ gap: 6, flexWrap: "nowrap" }}>
                          <button
                            className="btn btn-ok btn-sm"
                            onClick={() => setDecision({ req: r, status: "approved" })}
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDecision({ req: r, status: "rejected" })}
                          >
                            <X size={13} /> Reject
                          </button>
                        </div>
                      )}
                      {r.status === "pending" && !isAdmin && r.employee?.role === "manager" && (
                        <span className="small dim">Admin only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {decision && (
        <DecisionModal
          decision={decision}
          reviewerId={employee.id}
          review={review}
          onClose={() => setDecision(null)}
        />
      )}
    </>
  );
}

function DecisionModal({ decision, reviewerId, review, onClose }) {
  const [comment, setComment] = useState("");
  const { req, status } = decision;
  const approving = status === "approved";

  function submit(e) {
    e.preventDefault();
    review.mutate(
      { id: req.id, status, comment, reviewerId },
      { onSuccess: onClose }
    );
  }

  return (
    <Modal
      title={approving ? "Approve this request" : "Reject this request"}
      subtitle={`${req.employee?.full_name} · ${req.days_count} day${req.days_count > 1 ? "s" : ""} of ${req.leave_type} leave`}
      onClose={onClose}
    >
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card" style={{ boxShadow: "none", background: "var(--canvas)" }}>
          <div className="card-body" style={{ padding: 14 }}>
            <div className="eyebrow">Requested dates</div>
            <div className="mono" style={{ marginTop: 4 }}>
              {dateOnly(req.start_date)} → {dateOnly(req.end_date)}
            </div>
            {req.reason && (
              <>
                <div className="eyebrow" style={{ marginTop: 12 }}>Reason given</div>
                <p className="small muted" style={{ marginTop: 4 }}>{req.reason}</p>
              </>
            )}
          </div>
        </div>

        <Field label="Comment (optional)">
          <textarea
            className="textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={approving ? "Anything the employee should know" : "Why this is being turned down"}
          />
        </Field>

        {approving && (
          <p className="small dim">
            Approving deducts {req.days_count} day{req.days_count > 1 ? "s" : ""} from their {req.leave_type} balance.
          </p>
        )}

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className={`btn ${approving ? "btn-primary" : "btn-danger"}`} disabled={review.isPending}>
            {review.isPending ? "Saving…" : approving ? "Approve leave" : "Reject leave"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
