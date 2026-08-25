import { ShieldCheck, Twitter, Facebook, Instagram, Linkedin, Phone, Mail, MapPin } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold leading-tight text-slate-900">CivicConnect</p>
              <p className="text-[10px] font-semibold tracking-wide text-slate-400">CITIZEN GRIEVANCE PORTAL</p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-500">
            CivicConnect is a municipal grievance platform that connects citizens directly with the nearest
            responsible officer — with location proof, transparent timelines and measurable resolution targets.
          </p>
          <div className="mt-4 flex gap-3">
            {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
              <span
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold text-slate-900">Useful links</p>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>How it works</li>
            <li>Issue categories</li>
            <li>About the programme</li>
            <li>Track a complaint</li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold text-slate-900">Contact</p>
          <ul className="space-y-3 text-sm text-slate-500">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> 1800 425 8080 (toll free, 24×7)
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> support@civicconnect.gov.in
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" /> Municipal Corporation Annexe, N R Square,
              Bengaluru 560002
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 text-xs text-slate-400 sm:flex-row">
          <p>© 2026 CivicConnect · A citizen services initiative</p>
          <div className="flex gap-4">
            <span>Privacy policy</span>
            <span>Terms of use</span>
            <span>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
