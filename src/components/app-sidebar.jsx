import { NavLink, useLocation } from "react-router-dom";
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
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useLeaveRequests } from "@/hooks/useLeave";
import { preloadPage } from "@/routes/pages";

export function AppSidebar() {
  const { isAdmin, isManager, canApprove } = useAuth();
  const { data: pending } = useLeaveRequests({ status: "pending" });
  const pendingCount = pending?.length ?? 0;
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();

  const item = (to, Icon, label, count) => {
    const end = to === "/dashboard";
    const isActive = end ? pathname === to : pathname.startsWith(to);

    return (
      <SidebarMenuItem key={to}>
        <SidebarMenuButton
          isActive={isActive}
          onClick={() => setOpenMobile(false)}
          onMouseEnter={() => preloadPage(to)}
          onFocus={() => preloadPage(to)}
          onTouchStart={() => preloadPage(to)}
          render={<NavLink to={to} end={end} />}
        >
          <Icon />
          <span>{label}</span>
          {count > 0 && <span className="nav-count">{count}</span>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="nav-group">
          <div className="nav-label">Overview</div>
          <SidebarMenu>
            {item("/dashboard", LayoutDashboard, "Dashboard")}
          </SidebarMenu>
        </div>

        <div className="nav-group">
          <div className="nav-label">Me</div>
          <SidebarMenu>
            {!isAdmin && item("/leave", CalendarDays, "My leave")}
            {item("/attendance", Clock, "My attendance")}
            {item("/profile", UserCog, "Profile")}
          </SidebarMenu>
        </div>

        {canApprove && (
          <div className="nav-group">
            <div className="nav-label">Team</div>
            <SidebarMenu>
              {item(
                "/leave/approvals",
                ClipboardCheck,
                "Approvals",
                pendingCount,
              )}
              {item("/attendance/team", UsersRound, "Team attendance")}
            </SidebarMenu>
          </div>
        )}

        {(isAdmin || isManager) && (
          <div className="nav-group">
            <div className="nav-label">Administration</div>
            <SidebarMenu>
              {item("/employees", Users, "Employees")}
              {isAdmin && item("/departments", Building2, "Departments")}
            </SidebarMenu>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
