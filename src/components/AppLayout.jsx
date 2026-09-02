import { Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { TbLayoutSidebar } from "react-icons/tb";
import toast from "react-hot-toast";
import { SidebarProvider, useSidebar } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../services/apiAuth";
import { Badge } from "../ui/Bits";
import ParticleButton from "./kokonutui/particle-button";

function MenuToggleButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <button className="menu-btn btn btn-ghost btn-sm" onClick={toggleSidebar}>
      <TbLayoutSidebar size={16} />
    </button>
  );
}

export default function AppLayout() {
  const { employee, role } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "var(--sidebar-w)" }}>
      <AppSidebar />

      <div className="main">
        <header className="topbar">
          <MenuToggleButton />
          <div className="topbar-title">
            {greeting()}, {employee?.full_name?.split(" ")[0] ?? "there"}
          </div>

          <div className="topbar-right">
            {role && <Badge kind={role}>{role}</Badge>}

            <ParticleButton
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={handleLogout}
            >
              <LogOut size={10} /> Sign out
            </ParticleButton>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
