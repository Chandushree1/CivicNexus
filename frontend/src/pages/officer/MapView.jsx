import { useEffect, useState } from "react";
import { Navigation2 } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import MockMap from "../../components/MockMap";
import { StatusBadge, PriorityBadge } from "../../components/Badges";
import { getDirectionsUrl } from "../../utils/maps";
import api from "../../api/axios";

export default function MapView() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/complaints/map").then(({ data }) => setItems(data.items));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-extrabold text-slate-900">Map view</h1>
      <p className="mt-1 text-slate-500">Plan your route — urgent cases are marked in red.</p>

      <div className="mt-6">
        {items.length > 0 && (
          <MockMap items={items} mode="category" caption={`${items.length} open complaints plotted (mock coordinates)`} />
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((c) => (
          <div key={c._id} className="card">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">{c.complaintId}</span>
              <StatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
            </div>
            <p className="font-bold text-slate-900">{c.title}</p>
            <p className="mt-1 text-sm text-slate-500">
              {c.location?.address} · {c.distanceKm != null ? `${c.distanceKm.toFixed(1)} km away` : ""} · {c.location.lat}, {c.location.lng}
            </p>
            <a
              href={getDirectionsUrl(c.location.lat, c.location.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-3 inline-flex px-4 py-1.5 text-xs"
            >
              <Navigation2 className="h-3.5 w-3.5" /> Get directions
            </a>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

