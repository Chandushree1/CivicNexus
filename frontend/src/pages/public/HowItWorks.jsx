import { useNavigate } from "react-router-dom";
import { FileText, MapPin, UserCheck, Wrench, CheckCircle2 } from "lucide-react";
import PublicNavbar from "../../components/PublicNavbar";
import PublicFooter from "../../components/PublicFooter";

const steps = [
  {
    icon: FileText,
    title: "1. Report an issue",
    time: "Takes about 2 minutes",
    points: ["Select one of nine civic categories", "Describe the problem and set a priority", "Attach up to five photos as evidence"],
  },
  {
    icon: MapPin,
    title: "2. Location & verification",
    time: "Automatic, under 1 hour",
    points: [
      "GPS coordinates captured from your device",
      "Ward boundary and duplicate checks by the control room",
      "Invalid or private-land cases are routed to enforcement",
    ],
  },
  {
    icon: UserCheck,
    title: "3. Officer assignment",
    time: "Within 24 hours",
    points: [
      "Nearest officer with the right department skill is matched",
      "Urgent cases jump the queue with a 48-hour deadline",
      "You are notified with the officer's name and designation",
    ],
  },
  {
    icon: Wrench,
    title: "4. Issue resolution",
    time: "3–7 days depending on category",
    points: [
      "Officer marks work in progress and posts field updates",
      "Resolution photo and remarks are uploaded on completion",
      "You rate the work; low ratings reopen the case for audit",
    ],
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();
  return (
    <div>
      <PublicNavbar />

      <section className="bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-16 text-center">
        <h1 className="text-5xl font-extrabold text-slate-900">How CivicConnect works</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-500">
          Every complaint follows the same accountable path. Nothing sits in an inbox without a named officer
          and a deadline attached to it.
        </p>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-6 py-14">
        {steps.map(({ icon: Icon, title, time, points }) => (
          <div key={title} className="card">
            <div className="mb-4 flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white">
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-xl font-bold text-slate-900">{title}</p>
              <span className="badge bg-brand-50 text-brand-700">🕐 {time}</span>
            </div>
            <ul className="space-y-2 pl-1">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" /> {p}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="card flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-slate-600">
            Ready to try it? Submitting a complaint needs only a description, a photo and your location.
          </p>
          <div className="flex flex-shrink-0 gap-3">
            <button onClick={() => navigate("/register")} className="btn-primary">
              Report an issue
            </button>
            <button onClick={() => navigate("/issues")} className="btn-secondary">
              See categories
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
