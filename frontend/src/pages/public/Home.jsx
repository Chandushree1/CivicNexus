import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Search } from "lucide-react";
import PublicNavbar from "../../components/PublicNavbar";
import PublicFooter from "../../components/PublicFooter";
import { CATEGORIES, CategoryIcon } from "../../components/categories";
import api from "../../api/axios";

const STEPS = [
  {
    step: "STEP 1",
    title: "Report an issue",
    desc: "Pick a category, describe the problem and attach photos as proof. It takes under two minutes.",
  },
  {
    step: "STEP 2",
    title: "Location & verification",
    desc: "GPS coordinates are matched against ward boundaries so the complaint lands with the right department.",
  },
  {
    step: "STEP 3",
    title: "Officer assignment",
    desc: "The nearest available officer with the right skill set is assigned, along with a resolution deadline.",
  },
  {
    step: "STEP 4",
    title: "Issue resolution",
    desc: "Track every status change, view the resolution photo and rate the work once it is complete.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    api
      .get("/complaints/public/category-counts")
      .then(({ data }) => {
        const map = {};
        data.counts.forEach((c) => (map[c._id] = c.count));
        setCounts(map);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-sky-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2">
          <div>
            <span className="badge mb-5 border border-brand-200 bg-brand-50 text-brand-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Official municipal grievance channel
            </span>
            <h1 className="text-5xl font-extrabold leading-[1.05] text-slate-900">
              Report. Track.
              <br />
              Improve Your
              <br />
              Community.
            </h1>
            <p className="mt-5 max-w-lg text-slate-500">
              CivicConnect lets you raise civic complaints — garbage, potholes, streetlights, drainage, water
              supply and more — with photo and location proof. Your report reaches the nearest municipal
              officer, and you follow every step until it is resolved.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => navigate("/register")} className="btn-primary">
                Report an issue →
              </button>
              <button onClick={() => navigate("/issues")} className="btn-secondary">
                <Search className="h-4 w-4" /> Track complaint
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Average first response time in Bengaluru wards: <b className="text-slate-600">6 hours 40 minutes</b>
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex h-72 items-center justify-center bg-gradient-to-br from-sky-100 to-emerald-50 text-slate-400">
                Community illustration
              </div>
            </div>
            <div className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">83% resolved within SLA</p>
                <p className="text-xs text-slate-400">Across 128 municipal wards</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto -mt-2 max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {[
            ["1,42,860", "Issues Reported"],
            ["1,18,394", "Issues Resolved"],
            ["3,240", "Active Officers"],
            ["128", "Communities Served"],
          ].map(([num, label]) => (
            <div key={label} className="card text-center">
              <p className="text-3xl font-extrabold text-slate-900">{num}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-3xl font-extrabold text-slate-900">How CivicConnect works</h2>
        <p className="mt-2 text-slate-500">Four transparent stages, each with a timestamp and an accountable officer.</p>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.step} className="card">
              <span className="badge mb-4 bg-brand-50 text-brand-700">{s.step}</span>
              <p className="font-bold text-slate-900">{s.title}</p>
              <p className="mt-2 text-sm text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular categories */}
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">Popular complaint categories</h2>
              <p className="mt-2 text-slate-500">Choose the category that best matches your issue — it decides which department is notified.</p>
            </div>
            <button onClick={() => navigate("/issues")} className="btn-secondary hidden sm:flex">
              Browse all categories
            </button>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {CATEGORIES.slice(0, 6).map((c) => (
              <div key={c.name} className="card">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <CategoryIcon category={c.name} />
                </span>
                <p className="font-bold text-slate-900">{c.name}</p>
                <p className="mt-1 text-sm text-slate-500">{c.desc}</p>
                <p className="mt-3 text-sm font-semibold text-brand-600">
                  {counts[c.name] ?? "—"} open cases this month
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="card flex flex-col items-start justify-between gap-6 bg-slate-50 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Your ward improves when you report it</h3>
            <p className="mt-2 max-w-xl text-slate-500">
              Create a free citizen account to submit complaints, follow their progress and rate the resolution.
              Officers and administrators sign in through the same door.
            </p>
            <p className="mt-3 text-xs text-slate-400">🏢 Serving 128 municipal bodies across 9 states</p>
          </div>
          <div className="flex flex-shrink-0 gap-3">
            <button onClick={() => navigate("/register")} className="btn-primary">
              Create account
            </button>
            <button onClick={() => navigate("/login")} className="btn-secondary">
              Sign in
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
