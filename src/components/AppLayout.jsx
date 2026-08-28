import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../services/apiAuth";
import { Badge } from "../ui/Bits";

export default function AppLayout() {
  const { employee, role } = useAuth();
  const [open, setOpen] = useState(false);
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
    <div className="app">
      <Sidebar open={open} onNavigate={() => setOpen(false)} />
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="menu-btn btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
            <Menu size={16} />
          </button>
          <div className="topbar-title">
            {greeting()}, {employee?.full_name?.split(" ")[0] ?? "there"}
          </div>

          <div className="topbar-right">
            {role && <Badge kind={role}>{role}</Badge>}

            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
