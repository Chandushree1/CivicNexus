import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Clock, Wrench, CheckCircle2, AlertTriangle } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import ComplaintTable from "../../components/ComplaintTable";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function OfficerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ assigned: 0, newComplaints: 0, inProgress: 0, resolved: 0, overdue: 0 });
  const [assigned, setAssigned] = useState([]);
  const [nearby, setNearby] = useState([]);

  const refreshNearby = () =>
    api.get("/complaints/nearby").then(({ data }) => setNearby(data.items.filter((c) => !c.assignedOfficer).slice(0, 2)));
  const refreshAssigned = () => api.get("/complaints/assigned").then(({ data }) => setAssigned(data.complaints));

  useEffect(() => {
    api.get("/complaints/stats/officer").then(({ data }) => setStats(data.stats));
    refreshAssigned();
    refreshNearby();
  }, []);

  const accept = async (id) => {
    await api.patch(`/complaints/${id}/accept`);
    refreshNearby();
    refreshAssigned();
  };

  return (
    <DashboardLayout>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Welcome, {user?.fullName?.split(" ")[0]}</h1>
          <p className="mt-1 text-slate-500">
            {user?.designation} — {user?.department} · {user?.ward}
          </p>
        </div>
        <button onClick={() => navigate("/officer/nearby")} className="btn-primary">
          View nearby issues
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-5 md:grid-cols-5">
        <StatCard label="Assigned" value={stats.assigned} icon={ClipboardList} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatCard label="New complaints" value={stats.newComplaints} icon={Clock} iconBg="bg-sky-100" iconColor="text-sky-600" />
        <StatCard label="In progress" value={stats.inProgress} icon={Wrench} iconBg="bg-amber-100" iconColor="text-amber-600" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} iconBg="bg-green-100" iconColor="text-green-600" />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} iconBg="bg-red-100" iconColor="text-red-500" sub="Past the SLA deadline" />
      </div>

      <div className="card mb-8">
        <h2 className="mb-4 text-xl font-bold text-slate-900">My assigned complaints</h2>
        <ComplaintTable rows={assigned} navigate={navigate} base="/officer" />
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Nearby unassigned issues</h2>
          <button onClick={() => navigate("/officer/nearby")} className="text-sm font-semibold text-brand-600">
            See all
          </button>
        </div>
        <ComplaintTable rows={nearby} navigate={navigate} base="/officer" onAccept={accept} showAccept />
      </div>
    </DashboardLayout>
  );
}
