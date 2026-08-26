import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Clock, Wrench, CheckCircle2, PlusCircle } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import { StatusBadge, PriorityBadge } from "../../components/Badges";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const STAGES = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"];

function ProgressRow({ complaint }) {
  const currentIndex = STAGES.indexOf(complaint.status);
  return (
    <div className="border-b border-slate-100 py-4 last:border-0">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">
          {complaint.complaintId} · {complaint.title}
        </p>
        <StatusBadge status={complaint.status} />
      </div>
      <div className="grid grid-cols-5 gap-1">
        {STAGES.map((stage, i) => (
          <div key={stage}>
            <div className={`h-1.5 rounded-full ${i <= currentIndex ? "bg-brand-600" : "bg-slate-200"}`} />
            <p className={`mt-1.5 text-xs ${i <= currentIndex ? "text-brand-700 font-medium" : "text-slate-400"}`}>
              {stage}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    api.get("/complaints/stats/citizen").then(({ data }) => setStats(data.stats));    
    api.get("/complaints/mine").then(({ data }) => setComplaints(data.complaints));
  }, []);

  const active = complaints.filter((c) => c.status !== "Resolved").slice(0, 3);
  const resolvedComplaints = complaints.filter((c) => c.status === "Resolved").slice(0,3)
  const recent = complaints.slice(0, 5);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <DashboardLayout>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {greeting}, {user?.fullName?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-slate-500">Here is what is happening with the issues you reported.</p>
        </div>
        <button onClick={() => navigate("/citizen/report")} className="btn-primary">
          <PlusCircle className="h-4 w-4" /> Report an issue
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-5 md:grid-cols-4">
        <StatCard label="Total complaints" value={stats.total} icon={ClipboardList} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} iconBg="bg-amber-100" iconColor="text-amber-600" />
        <StatCard label="In progress" value={stats.inProgress} icon={Wrench} iconBg="bg-sky-100" iconColor="text-sky-600" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} iconBg="bg-green-100" iconColor="text-green-600" />
      </div>

      {active.length > 0 && (
        <div className="card mb-8">
          <h2 className="mb-2 text-xl font-bold text-slate-900">Active complaint progress</h2>
          {active.map((c) => (
            <ProgressRow key={c._id} complaint={c} />
          ))}
        </div>
      )}

      {resolvedComplaints.length > 0 && (
        <div className="card mb-8">
          <h2 className="mb-2 text-xl font-bold text-slate-900">Resolved complaints</h2>
          {resolvedComplaints.map((c) => (
            <ProgressRow key={c._id} complaint={c} />
          ))}
        </div>
      )}

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent complaints</h2>
          <button onClick={() => navigate("/citizen/complaints")} className="text-sm font-semibold text-brand-600">
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="pb-3 font-medium">Complaint ID</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium">Reported</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Priority</th>
                <th className="pb-3 font-medium">Officer</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((c) => (
                <tr key={c._id} className="border-t border-slate-100">
                  <td className="py-3 font-semibold text-slate-800">{c.complaintId}</td>
                  <td className="py-3 text-slate-600">{c.category}</td>
                  <td className="max-w-[180px] truncate py-3 text-slate-600">{c.location?.address}</td>
                  <td className="py-3 text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3 text-slate-500">{c.assignedOfficer?.fullName || "—"}</td>
                  <td className="py-3">
                    <button
                      onClick={() => navigate(`/citizen/complaints/${c._id}`)}
                      className="btn-secondary px-4 py-1.5 text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No complaints yet. Report your first issue to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
