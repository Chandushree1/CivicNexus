import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import ComplaintTable from "../../components/ComplaintTable";
import { CATEGORIES } from "../../components/categories";
import api from "../../api/axios";

const STATUSES = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export default function AllComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [officerFilter, setOfficerFilter] = useState("all");

  const load = () =>
    api
      .get("/admin/complaints", { params: { search, category, status, priority, officer: officerFilter } })
      .then(({ data }) => setComplaints(data.complaints));

  useEffect(() => {
    api.get("/admin/officers").then(({ data }) => setOfficers(data.officers));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, status, priority, officerFilter]);

  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-extrabold text-slate-900">All complaints</h1>
      <p className="mt-1 text-slate-500">{complaints.length} complaint(s) across every ward and department.</p>

      <div className="card my-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, title, locality"
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
        <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="all">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select className="input" value={officerFilter} onChange={(e) => setOfficerFilter(e.target.value)}>
          <option value="all">All officers</option>
          <option value="unassigned">Unassigned</option>
          {officers.map((o) => (
            <option key={o._id} value={o._id}>
              {o.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <ComplaintTable rows={complaints} navigate={navigate} base="/admin" />
      </div>
    </DashboardLayout>
  );
}
