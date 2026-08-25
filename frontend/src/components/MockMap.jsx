import { MapPin, Navigation } from "lucide-react";

const priorityColor = {
  Urgent: "bg-red-500 text-white",
  High: "bg-amber-500 text-white",
  Medium: "bg-blue-600 text-white",
  Low: "bg-slate-500 text-white",
};

// Deterministically spreads complaints across the mock map canvas based on lat/lng
function computePositions(items) {
  const lats = items.map((i) => i.location.lat);
  const lngs = items.map((i) => i.location.lng);
  const minLat = Math.min(...lats),
    maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs),
    maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  return items.map((item) => {
    const x = 8 + ((item.location.lng - minLng) / lngRange) * 84;
    const y = 8 + ((maxLat - item.location.lat) / latRange) * 76;
    return { ...item, x, y };
  });
}

export default function MockMap({ items, mode = "category", caption }) {
  const positioned = computePositions(items);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="relative h-[300px] w-full bg-sky-100 sm:h-[380px]" style={mapGridStyle}>
        {/* diagonal road line, purely decorative like the original mock */}
        <div className="pointer-events-none absolute left-[-5%] top-[38%] h-[3px] w-[110%] -rotate-2 bg-white/80" />

        {positioned.map((item) => (
          <div
            key={item._id || item.complaintId}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            title={item.title}
          >
            <span
              className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold shadow ${
                priorityColor[item.priority] || priorityColor.Medium
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              {mode === "distance" ? `${item.distanceKm?.toFixed(1) ?? "—"} km` : item.category}
            </span>
          </div>
        ))}

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow">
          <Navigation className="h-3.5 w-3.5" />
          Map preview (mock)
        </div>
      </div>
      {caption && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">{caption}</div>
      )}
    </div>
  );
}

const mapGridStyle = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
  backgroundSize: "36px 36px",
};
