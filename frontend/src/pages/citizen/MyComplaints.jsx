import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PlusCircle, Search, MapPin, Calendar, UserRound } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { StatusBadge, PriorityBadge } from "../../components/Badges";
import { CATEGORIES, CategoryIcon } from "../../components/categories";
import api from "../../api/axios";

const STATUSES = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"];

export default function MyComplaints() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api
      .get("/complaints/mine", { params: { search, category, status, sort } })
      .then(({ data }) => setComplaints(data.complaints))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, status, sort]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const timeAgo = (date) => {
    const days = Math.max(1, Math.floor((Date.now() - new Date(date)) / 86400000));
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My complaints</h1>
          <p className="mt-1 text-slate-500">{complaints.length} complaint(s) match your filters.</p>
        </div>
        <button onClick={() => navigate("/citizen/report")} className="btn-primary">
          <PlusCircle className="h-4 w-4" /> Report an issue
        </button>
      </div>

      <div className="card mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, title or locality"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {complaints.map((c) => (
          <div key={c._id} className="card flex flex-col">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <CategoryIcon category={c.category} className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold text-slate-500">{c.complaintId}</span>
            </div>
            <p className="font-bold text-slate-900">{c.title}</p>
            <p className="text-sm text-slate-400">{c.category}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
            </div>
            <div className="mt-4 space-y-1.5 text-sm text-slate-500">
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{c.location?.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                Reported {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · updated {timeAgo(c.updatedAt)}
              </p>
              <p className="flex items-center gap-2">
                <UserRound className="h-3.5 w-3.5 flex-shrink-0" />
                {c.assignedOfficer?.fullName || "Awaiting officer assignment"}
              </p>
            </div>
            <button onClick={() => navigate(`/citizen/complaints/${c._id}`)} className="btn-secondary mt-5 w-full">
              View details
            </button>
          </div>
        ))}
        {!loading && complaints.length === 0 && (
          <p className="col-span-full py-16 text-center text-slate-400">No complaints match these filters.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
