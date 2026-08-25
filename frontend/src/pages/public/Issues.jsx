import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../../components/PublicNavbar";
import PublicFooter from "../../components/PublicFooter";
import { CATEGORIES, CategoryIcon } from "../../components/categories";
import { StatusBadge, PriorityBadge } from "../../components/Badges";
import api from "../../api/axios";

export default function Issues() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api
      .get("/complaints/public/category-counts")
      .then(({ data }) => {
        const map = {};
        data.counts.forEach((c) => (map[c._id] = c.count));
        setCounts(map);
      })
      .catch(() => {});
    api
      .get("/complaints/public/recent")
      .then(({ data }) => setRecent(data.complaints))
      .catch(() => {});
  }, []);

  return (
    <div>
      <PublicNavbar />

      <section className="bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-5xl font-extrabold text-slate-900">Issues we handle</h1>
          <p className="mt-4 max-w-2xl text-slate-500">
            Nine categories cover the vast majority of neighbourhood complaints. Each one maps to a municipal
            department with its own service-level target.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <div key={c.name} className="card">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <CategoryIcon category={c.name} />
              </span>
              <p className="font-bold text-slate-900">{c.name}</p>
              <p className="mt-1 text-sm text-slate-500">{c.desc}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-brand-600">{counts[c.name] ?? "—"} open</span>
                <button onClick={() => navigate("/register")} className="font-semibold text-brand-600">
                  Report this →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-extrabold text-slate-900">Recently reported in Bengaluru</h2>
          <p className="mt-2 text-slate-500">A live sample of public complaints. Personal details are never shown publicly.</p>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            {recent.map((c) => (
              <div key={c._id} className="card">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">{c.complaintId}</span>
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
                <p className="font-bold text-slate-900">{c.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {c.category} · {c.location?.address}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Reported {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/register")} className="btn-primary mt-8">
            Report your issue
          </button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
