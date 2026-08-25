import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Bell,
  User,
  LogOut,
  Users,
  Map,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const citizenLinks = [
  { to: "/citizen/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/citizen/report", label: "Report Issue", icon: PlusCircle },
  { to: "/citizen/complaints", label: "My Complaints", icon: ClipboardList },
  { to: "/citizen/notifications", label: "Notifications", icon: Bell },
  { to: "/citizen/profile", label: "Profile", icon: User },
];

const officerLinks = [
  { to: "/officer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/officer/assigned", label: "Assigned Complaints", icon: ClipboardList },
  { to: "/officer/nearby", label: "Nearby Issues", icon: Users },
  { to: "/officer/map", label: "Map View", icon: Map },
  { to: "/officer/notifications", label: "Notifications", icon: Bell },
  { to: "/officer/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === "officer" ? officerLinks : citizenLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex h-screen w-[280px] flex-shrink-0 flex-col justify-between border-r border-slate-200 bg-white px-5 py-6">
      <div>
        <div className="mb-8 flex items-center gap-2 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold leading-tight text-slate-900">CivicConnect</p>
            <p className="text-[10px] font-semibold tracking-wide text-slate-400">
              CITIZEN GRIEVANCE PORTAL
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div>
        <div className="mb-3 border-t border-slate-200 pt-4">
          <p className="px-1 text-[11px] font-bold tracking-wide text-slate-400">
            {user?.role === "officer" ? "MUNICIPAL OFFICER" : "CITIZEN ACCOUNT"}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  );
}
