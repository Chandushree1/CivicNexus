import { useEffect, useState } from "react";
import { Pencil, KeyRound, ClipboardList, CheckCircle2, Clock } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
  });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [stats, setStats] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const endpoint =
      user?.role === "admin"
        ? "/admin/overview"
        : user?.role === "officer"
        ? "/complaints/stats/officer"
        : "/complaints/stats/citizen";
    api.get(endpoint).then(({ data }) => setStats(data.stats));
  }, [user?.role]);

  const initials = (user?.fullName || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const saveProfile = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/users/profile", form);
    updateUser(data.user);
    setEditing(false);
    setMsg("Profile updated");
  };

  const savePassword = async (e) => {
    e.preventDefault();
    await api.put("/users/change-password", pwForm);
    setChangingPw(false);
    setPwForm({ currentPassword: "", newPassword: "" });
    setMsg("Password changed");
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-extrabold text-slate-900">My profile</h1>
      <p className="mt-1 text-slate-500">Keep your contact details current so officers can reach you about your complaints.</p>

      <div className="card mt-6">
        <div className="flex items-center gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
            {initials}
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900">{user?.fullName}</p>
            <div className="mt-2 flex gap-3">
              <button onClick={() => setEditing((s) => !s)} className="btn-primary px-4 py-2 text-sm">
                <Pencil className="h-3.5 w-3.5" /> Edit profile
              </button>
              <button onClick={() => setChangingPw((s) => !s)} className="btn-secondary px-4 py-2 text-sm">
                <KeyRound className="h-3.5 w-3.5" /> Change password
              </button>
            </div>
          </div>
        </div>

        {msg && <p className="mt-4 text-sm font-semibold text-green-600">{msg}</p>}

        {editing ? (
          <form onSubmit={saveProfile} className="mt-6 grid grid-cols-1 gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
            <div>
              <label className="label">Full name</label>
              <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <textarea className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="label">City</label>
              <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">
                Save changes
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Full name</p>
              <p className="mt-1 text-slate-800">{user?.fullName}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Email</p>
              <p className="mt-1 text-slate-800">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Phone</p>
              <p className="mt-1 text-slate-800">{user?.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Address</p>
              <p className="mt-1 text-slate-800">{user?.address || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">City</p>
              <p className="mt-1 text-slate-800">{user?.city}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Member since</p>
              <p className="mt-1 text-slate-800">
                {new Date(user?.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        )}

        {changingPw && (
          <form onSubmit={savePassword} className="mt-6 grid grid-cols-1 gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
            <div>
              <label className="label">Current password</label>
              <input
                type="password"
                className="input"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="label">New password</label>
              <input
                type="password"
                className="input"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">
                Update password
              </button>
            </div>
          </form>
        )}
      </div>

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3">
          {user?.role === "admin" ? (
            <>
              <StatBox label="Total complaints" value={stats.totalComplaints} icon={ClipboardList} />
              <StatBox label="Resolution rate" value={`${stats.resolutionRate}%`} icon={CheckCircle2} />
              <StatBox label="Overdue" value={stats.overdue} icon={Clock} />
            </>
          ) : user?.role === "officer" ? (
            <>
              <StatBox label="Assigned" value={stats.assigned} icon={ClipboardList} />
              <StatBox label="Resolved" value={stats.resolved} icon={CheckCircle2} />
              <StatBox label="Overdue" value={stats.overdue} icon={Clock} />
            </>
          ) : (
            <>
              <StatBox label="Total complaints" value={stats.total} icon={ClipboardList} />
              <StatBox label="Resolved" value={stats.resolved} icon={CheckCircle2} />
              <StatBox label="Pending" value={stats.pending} icon={Clock} />
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

function StatBox({ label, value, icon: Icon }) {
  return (
    <div className="card flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <Icon className="h-5 w-5" />
      </span>
    </div>
  );
}
