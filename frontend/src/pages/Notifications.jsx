import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, FileText, UserCheck, Bell, CheckCircle2, CheckCheck } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const iconMap = {
  officer_update: { icon: RotateCcw, bg: "bg-amber-100", color: "text-amber-600" },
  complaint_submitted: { icon: FileText, bg: "bg-blue-100", color: "text-blue-600" },
  officer_assigned: { icon: UserCheck, bg: "bg-blue-100", color: "text-blue-600" },
  status_changed: { icon: Bell, bg: "bg-slate-100", color: "text-slate-500" },
  complaint_resolved: { icon: CheckCircle2, bg: "bg-green-100", color: "text-green-600" },
  feedback_thanks: { icon: Bell, bg: "bg-slate-100", color: "text-slate-500" },
};

function timeAgo(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (days <= 0) return "today";
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const base = user?.role === "officer" ? "/officer" : "/citizen";

  const load = () => api.get("/notifications").then(({ data }) => setNotifications(data.notifications));

  useEffect(() => {
    load();
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    load();
  };

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    load();
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Notifications</h1>
          <p className="mt-1 text-slate-500">
            {unread} unread of {notifications.length} total
          </p>
        </div>
        <button onClick={markAllRead} className="btn-secondary">
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => {
          const meta = iconMap[n.type] || iconMap.status_changed;
          const Icon = meta.icon;
          return (
            <div
              key={n._id}
              className={`card flex items-start gap-4 ${!n.read ? "border-brand-200 bg-brand-50/40" : ""}`}
            >
              <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${meta.bg} ${meta.color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">{n.title}</p>
                  {!n.read && <span className="badge bg-brand-600 text-white">NEW</span>}
                </div>
                <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-slate-400">{timeAgo(n.createdAt)}</span>
                  {n.complaint && (
                    <button
                      onClick={() => navigate(`${base}/complaints/${n.complaint._id}`)}
                      className="font-semibold text-brand-600"
                    >
                      View complaint
                    </button>
                  )}
                  {!n.read && (
                    <button onClick={() => markRead(n._id)} className="font-semibold text-slate-500">
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {notifications.length === 0 && <p className="py-16 text-center text-slate-400">You're all caught up.</p>}
      </div>
    </DashboardLayout>
  );
}
