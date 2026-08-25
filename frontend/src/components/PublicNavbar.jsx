import { NavLink, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/issues", label: "Issues" },
  { to: "/about", label: "About" },
];

export default function PublicNavbar() {
  const navigate = useNavigate();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold leading-tight text-slate-900">CivicConnect</p>
            <p className="text-[10px] font-semibold tracking-wide text-slate-400">CITIZEN GRIEVANCE PORTAL</p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? "bg-brand-100 text-brand-700" : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/login")} className="text-sm font-semibold text-slate-700">
            Login
          </button>
          <button onClick={() => navigate("/register")} className="btn-primary">
            Register
          </button>
        </div>
      </div>
    </header>
  );
}
