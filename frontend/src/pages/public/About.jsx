import { useNavigate } from "react-router-dom";
import { Users, CheckCircle2, ClipboardList, Lock } from "lucide-react";
import PublicNavbar from "../../components/PublicNavbar";
import PublicFooter from "../../components/PublicFooter";

export default function About() {
  const navigate = useNavigate();
  return (
    <div>
      <PublicNavbar />

      <section className="bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-5xl font-extrabold text-slate-900">About CivicConnect</h1>
          <p className="mt-4 max-w-2xl text-slate-500">
            CivicConnect was created to close the gap between a citizen noticing a problem and a municipal
            officer fixing it. Instead of phone calls that disappear, every complaint becomes a tracked record
            with a location, an owner and a deadline.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            [Users, "Citizen first", "Anyone with a phone can raise a complaint in under two minutes — no office visits, no paperwork."],
            [CheckCircle2, "Officer accountability", "Each case has a named officer, an SLA clock and an audit trail visible to the citizen."],
            [ClipboardList, "Open measurement", "Ward-level dashboards publish resolution rates, overdue counts and average turnaround time."],
          ].map(([Icon, title, desc]) => (
            <div key={title} className="card">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <p className="font-bold text-slate-900">{title}</p>
              <p className="mt-2 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
            <Lock className="h-5 w-5" /> Privacy policy &amp; data use
          </h2>
          <div className="mt-5 space-y-4 text-slate-600">
            <p>
              We collect only what is needed to resolve your complaint: your name, contact details, the
              complaint description, photographs you choose to upload and the location of the issue.
            </p>
            <p>
              Your name and phone number are shared with the assigned officer and the ward control room. They
              are never shown on public listings, and photographs are stripped of device metadata before
              storage.
            </p>
            <p>
              Complaint records are retained for seven years for audit purposes. You may request a copy or
              deletion of your personal data by writing to{" "}
              <b className="text-slate-900">privacy@civicconnect.gov.in</b>.
            </p>
            <p>
              Aggregated, anonymised statistics — such as the number of potholes reported in a ward — are
              published as open data for research and civic planning.
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={() => navigate("/register")} className="btn-primary">
              Create citizen account
            </button>
            <button onClick={() => navigate("/how-it-works")} className="btn-secondary">
              See how it works
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
