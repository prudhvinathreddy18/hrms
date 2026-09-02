import { Link } from "react-router-dom";
import BarChart from "../components/charts/bar-chart";
import Bar from "../components/charts/bar";
import { BarDepthBack, BarDepthFront } from "../components/charts/bar-depth";
import BarXAxis from "../components/charts/bar-x-axis";
import Grid from "../components/charts/grid";
import { ChartTooltip } from "../components/charts/tooltip";
import { useAuth } from "../contexts/AuthContext";
import { useDashboardStats } from "../hooks/usePayroll";
import { useLeaveRequests, useLeaveBalances } from "../hooks/useLeave";
import ClockCard from "./partials/ClockCard";
import { Stat, Badge, Spinner, Empty } from "../ui/Bits";
import { dayMonth } from "../lib/format";
import { format } from "date-fns";

export default function Dashboard() {
  const { employee, isAdmin, canApprove } = useAuth();
  const { data: stats } = useDashboardStats();
  const { data: balances } = useLeaveBalances(employee?.id);
  const { data: myLeave } = useLeaveRequests({ employeeId: employee?.id });
  const { data: pending } = useLeaveRequests({ status: "pending" });

  const attendanceRate =
    stats && stats.total_employees
      ? Math.round((stats.present_today / stats.total_employees) * 100)
      : 0;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">
            Today · {format(new Date(), "EEEE d MMMM")}
          </div>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div
        className="grid g2"
        style={{ gridTemplateColumns: "1.1fr 1fr", marginBottom: 16 }}
      >
        <ClockCard />

        <div className="card">
          <div className="card-head">
            <h2>Leave balance</h2>
            <div className="actions">
              <Link to="/leave" className="btn btn-ghost btn-sm">
                Apply
              </Link>
            </div>
          </div>
          <div className="card-body">
            {!balances ? (
              <Spinner />
            ) : balances.length === 0 ? (
              <Empty title="No allocation yet">
                Your leave quota hasn't been set.
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

      {isAdmin && stats && (
        <div className="grid g4" style={{ marginBottom: 16 }}>
          <Stat
            label="Headcount"
            value={stats.total_employees}
            sub="Active employees"
          />
          <Stat
            label="Present today"
            value={stats.present_today}
            sub={`${attendanceRate}% of headcount`}
          />
          <Stat
            label="Pending approvals"
            value={stats.pending_leaves}
            sub="Awaiting a decision"
          />
          <Stat
            label="Departments"
            value={stats.total_departments}
            sub={`~${
              stats.total_departments
                ? Math.round(stats.total_employees / stats.total_departments)
                : 0
            } people per team`}
          />
        </div>
      )}

      <div className="grid g2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <h2>My recent requests</h2>
          </div>
          {!myLeave?.length ? (
            <Empty title="Nothing on file">
              You haven't applied for leave yet.
            </Empty>
          ) : (
            <div className="table-wrap">
              <table className="tbl">
                <tbody>
                  {myLeave.slice(0, 5).map((r) => (
                    <tr key={r.id}>
                      <td
                        style={{ textTransform: "capitalize", fontWeight: 600 }}
                      >
                        {r.leave_type}
                      </td>
                      <td className="mono small dim">
                        {dayMonth(r.start_date)} – {dayMonth(r.end_date)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Badge kind={r.status}>{r.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isAdmin && stats?.by_department?.length ? (
          <div className="card">
            <div className="card-head">
              <h2>Headcount by department</h2>
            </div>
            <div className="card-body" style={{ height: 240 }}>
              <BarChart
                margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
                data={stats.by_department}
                xDataKey="department"
              >
                <Grid horizontal />
                <BarDepthBack dataKey="count" color="var(--pine-500)" />
                <Bar dataKey="count" fill="var(--pine-500)" perspective />
                <BarDepthFront dataKey="count" />
                <BarXAxis />
                <ChartTooltip showCrosshair={false} showDots={false} />
              </BarChart>
            </div>
          </div>
        ) : canApprove ? (
          <div className="card">
            <div className="card-head">
              <h2>Waiting on you</h2>
              <div className="actions">
                <Link to="/leave/approvals" className="btn btn-ghost btn-sm">
                  Review
                </Link>
              </div>
            </div>
            {!pending?.length ? (
              <Empty title="All clear">
                No requests are waiting for a decision.
              </Empty>
            ) : (
              <div className="table-wrap">
                <table className="tbl">
                  <tbody>
                    {pending.slice(0, 5).map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>
                          {r.employee?.full_name}
                        </td>
                        <td className="mono small dim">
                          {dayMonth(r.start_date)} – {dayMonth(r.end_date)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Badge kind="pending">{r.days_count}d</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
