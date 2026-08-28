import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Clock,
  UsersRound,
  UserCog,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLeaveRequests } from "../hooks/useLeave";

export default function Sidebar({ open, onNavigate }) {
  const { isAdmin, isManager, canApprove } = useAuth();
  const { data: pending } = useLeaveRequests({ status: "pending" });
  const pendingCount = pending?.length ?? 0;

  const item = (to, Icon, label, count) => (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      onClick={onNavigate}
    >
      <Icon />
      {label}
      {count > 0 && <span className="nav-count">{count}</span>}
    </NavLink>
  );

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <nav>
        <div className="nav-group">
          <div className="nav-label">Overview</div>
          {item("/dashboard", LayoutDashboard, "Dashboard")}
        </div>

        <div className="nav-group">
          <div className="nav-label">Me</div>
          {!isAdmin && item("/leave", CalendarDays, "My leave")}
          {item("/attendance", Clock, "My attendance")}
          {item("/profile", UserCog, "Profile")}
        </div>

        {canApprove && (
          <div className="nav-group">
            <div className="nav-label">Team</div>
            {item(
              "/leave/approvals",
              ClipboardCheck,
              "Approvals",
              pendingCount,
            )}
            {item("/attendance/team", UsersRound, "Team attendance")}
          </div>
        )}

        {(isAdmin || isManager) && (
          <div className="nav-group">
            <div className="nav-label">Administration</div>
            {item("/employees", Users, "Employees")}
            {isAdmin && item("/departments", Building2, "Departments")}
          </div>
        )}
      </nav>
    </aside>
  );
}
