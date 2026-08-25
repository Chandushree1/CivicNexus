export default function StatCard({ label, value, icon: Icon, iconBg = "bg-blue-100", iconColor = "text-blue-600", sub }) {
  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
      </div>
      {Icon && (
        <span className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </span>
      )}
    </div>
  );
}
