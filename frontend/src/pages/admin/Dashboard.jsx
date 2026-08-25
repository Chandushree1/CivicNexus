import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Users,
  UserCog,
  Star,
  Timer,
  FolderKanban,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import ComplaintTable from "../../components/ComplaintTable";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get("/admin/overview").then(({ data }) => setStats(data.stats));
    api.get("/admin/complaints").then(({ data }) => setRecent(data.complaints.slice(0, 6)));
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin overview</h1>
          <p className="mt-1 text-slate-500">
            {user?.designation || "Ward Administrator"} · Platform-wide visibility across all wards
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/admin/officers")} className="btn-secondary">
            Manage officers
          </button>
          <button onClick={() => navigate("/admin/complaints")} className="btn-primary">
            View all complaints
          </button>
        </div>
      </div>

      {stats && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-5 md:grid-cols-4">
            <StatCard label="Total complaints" value={stats.totalComplaints} icon={ClipboardList} iconBg="bg-blue-100" iconColor="text-blue-600" />
            <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} iconBg="bg-green-100" iconColor="text-green-600" sub={`${stats.resolutionRate}% resolution rate`} />
            <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} iconBg="bg-red-100" iconColor="text-red-500" sub="Past SLA deadline" />
            <StatCard label="Unassigned" value={stats.unassigned} icon={FolderKanban} iconBg="bg-amber-100" iconColor="text-amber-600" />
          </div>

          <div className="mb-8 grid grid-cols-2 gap-5 md:grid-cols-4">
            <StatCard label="Active citizens" value={stats.citizens} icon={Users} iconBg="bg-sky-100" iconColor="text-sky-600" />
            <StatCard label="Active officers" value={stats.officers} icon={UserCog} iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <StatCard label="Avg. resolution time" value={`${stats.avgResolutionDays}d`} icon={Timer} iconBg="bg-slate-100" iconColor="text-slate-600" />
            <StatCard label="Avg. citizen rating" value={stats.avgRating ?? "—"} icon={Star} iconBg="bg-amber-100" iconColor="text-amber-500" />
          </div>
        </>
      )}

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recently reported</h2>
          <button onClick={() => navigate("/admin/complaints")} className="text-sm font-semibold text-brand-600">
            View all
          </button>
        </div>
        <ComplaintTable rows={recent} navigate={navigate} base="/admin" />
      </div>
    </DashboardLayout>
  );
}
