import { useState } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { useMyAttendance } from "../hooks/useAttendance";
import ClockCard from "./partials/ClockCard";
import { Spinner, Empty, Stat, ErrorBox } from "../ui/Bits";
import { dateOnly, clock } from "../lib/format";

export default function Attendance() {
  const { employee } = useAuth();
  const [range, setRange] = useState("30");

  const to = new Date();
  const from =
    range === "month"
      ? startOfMonth(to)
      : subDays(to, Number(range) - 1);
  const rangeEnd = range === "month" ? endOfMonth(to) : to;

  const { data, isLoading, error } = useMyAttendance(
    employee?.id,
    format(from, "yyyy-MM-dd"),
    format(rangeEnd, "yyyy-MM-dd")
  );

  const totalHours = (data ?? []).reduce((s, r) => s + Number(r.hours_worked || 0), 0);
  const daysPresent = (data ?? []).filter((r) => r.check_in).length;
  const avg = daysPresent ? (totalHours / daysPresent).toFixed(1) : "0";

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">My record</div>
          <h1>Attendance</h1>
        </div>
        <div className="actions">
          <select className="select" value={range} onChange={(e) => setRange(e.target.value)} style={{ width: 160 }}>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="month">This month</option>
          </select>
        </div>
      </div>

      <div className="grid g2" style={{ gridTemplateColumns: "1fr 1.2fr", marginBottom: 16 }}>
        <ClockCard />
        <div className="grid g2" style={{ alignContent: "start" }}>
          <Stat label="Days present" value={daysPresent} sub="In selected range" />
          <Stat label="Hours logged" value={totalHours.toFixed(1)} sub="Check-in to check-out" />
          <Stat label="Average day" value={`${avg}h`} sub="Per day present" />
          <Stat label="Records" value={data?.length ?? 0} sub="Rows on file" />
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h2>Daily log</h2></div>
        {error ? (
          <ErrorBox error={error} />
        ) : isLoading ? (
          <Spinner />
        ) : !data?.length ? (
          <Empty title="No entries yet">Check in from the time clock above to start your record.</Empty>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check in</th>
                  <th>Check out</th>
                  <th className="num">Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{dateOnly(r.work_date)}</td>
                    <td className="mono">{clock(r.check_in)}</td>
                    <td className="mono">{clock(r.check_out)}</td>
                    <td className="num">{r.hours_worked ?? "—"}</td>
                    <td className="small dim">
                      {r.check_out ? "Complete" : r.check_in ? "Open — no check-out" : "—"}
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
