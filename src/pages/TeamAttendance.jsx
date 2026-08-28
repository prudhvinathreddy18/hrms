import { useState } from "react";
import { useTeamAttendance } from "../hooks/useAttendance";
import { Empty, Person, Spinner, Stat, ErrorBox, Badge } from "../ui/Bits";
import { clock, todayISO } from "../lib/format";

export default function TeamAttendance() {
  const [date, setDate] = useState(todayISO());
  const { data, isLoading, error } = useTeamAttendance(date);

  const complete = (data ?? []).filter((r) => r.check_out).length;
  const open = (data ?? []).filter((r) => r.check_in && !r.check_out).length;
  const hours = (data ?? []).reduce((s, r) => s + Number(r.hours_worked || 0), 0);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Team</div>
          <h1>Attendance</h1>
        </div>
        <div className="actions">
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 170 }} />
        </div>
      </div>

      <div className="grid g4" style={{ marginBottom: 16 }}>
        <Stat label="Checked in" value={data?.length ?? 0} sub="On this date" />
        <Stat label="Completed days" value={complete} sub="Checked in and out" />
        <Stat label="Still open" value={open} sub="No check-out yet" />
        <Stat label="Total hours" value={hours.toFixed(1)} sub="Across the team" />
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Roll for {date}</h2>
          <div className="actions"><span className="mono small dim">{data?.length ?? 0} rows</span></div>
        </div>

        {error ? (
          <ErrorBox error={error} />
        ) : isLoading ? (
          <Spinner />
        ) : !data?.length ? (
          <Empty title="Nobody checked in">
            No attendance was recorded on this date. Try another day.
          </Empty>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Check in</th>
                  <th>Check out</th>
                  <th className="num">Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id}>
                    <td><Person name={r.employee?.full_name ?? "—"} sub={r.employee?.email} /></td>
                    <td className="small muted">{r.employee?.department?.name ?? "—"}</td>
                    <td className="mono">{clock(r.check_in)}</td>
                    <td className="mono">{clock(r.check_out)}</td>
                    <td className="num">{r.hours_worked ?? "—"}</td>
                    <td>
                      <Badge kind={r.check_out ? "approved" : "pending"}>
                        {r.check_out ? "Complete" : "Open"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
