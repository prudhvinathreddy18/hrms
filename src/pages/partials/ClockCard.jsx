import { useEffect, useState } from "react";
import { format } from "date-fns";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  useTodayAttendance,
  useCheckIn,
  useCheckOut,
} from "../../hooks/useAttendance";
import { clock } from "../../lib/format";
import { useLeaveRequests } from "../../hooks/useLeave";

export default function ClockCard() {
  const { employee } = useAuth();
  const { data: today, isLoading } = useTodayAttendance(employee?.id);
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const [now, setNow] = useState(new Date());
  const { data: leaveRequests = [] } = useLeaveRequests({
    employeeId: employee?.id,
  });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const todayISO = format(now, "yyyy-MM-dd");
  const onApprovedLeave = leaveRequests.some(
    (r) =>
      r.status === "approved" &&
      r.start_date <= todayISO &&
      todayISO <= r.end_date,
  );

  const notIn = !today?.check_in;
  const inNotOut = today?.check_in && !today?.check_out;
  const done = today?.check_in && today?.check_out;

  return (
    <div className="clock">
      <div>
        <div className="eyebrow" style={{ color: "#86a5a0" }}>
          Time clock
        </div>
        <div className="time" style={{ marginTop: 8 }}>
          {format(now, "HH:mm:ss")}
        </div>
        <div className="date">{format(now, "EEEE, d MMMM yyyy")}</div>
      </div>

      {isLoading ? (
        <div className="date">Loading today's record…</div>
      ) : notIn ? (
        <button
          className="btn btn-clock btn-block"
          onClick={() => checkIn.mutate(employee.id)}
          disabled={checkIn.isPending}
        >
          <LogIn size={16} /> {checkIn.isPending ? "Checking in…" : "Check in"}
        </button>
      ) : inNotOut ? (
        <button
          className="btn btn-clock btn-block"
          onClick={() => checkOut.mutate(today.id)}
          disabled={checkOut.isPending || onApprovedLeave}
        >
          <LogOut size={16} />{" "}
          {onApprovedLeave
            ? "On approved leave"
            : checkIn.isPending
              ? "Checking in…"
              : "Check out"}
        </button>
      ) : (
        <button className="btn btn-clock btn-block" disabled>
          Day closed — {today.hours_worked}h logged
        </button>
      )}

      {today && (
        <div className="clock-marks">
          <div>
            <div className="k">In</div>
            <div className="v">{clock(today.check_in)}</div>
          </div>
          <div>
            <div className="k">Out</div>
            <div className="v">{clock(today.check_out)}</div>
          </div>
          <div>
            <div className="k">Hours</div>
            <div className="v">{done ? today.hours_worked : "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
}
