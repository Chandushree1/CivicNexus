import { Navigation2 } from "lucide-react";
import { StatusBadge, PriorityBadge } from "./Badges";
import { getDirectionsUrl } from "../utils/maps";

export default function ComplaintTable({ rows, navigate, base, onAccept, showAccept }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-slate-400">
            <th className="pb-3 font-medium">Complaint ID</th>
            <th className="pb-3 font-medium">Category</th>
            <th className="pb-3 font-medium">Citizen</th>
            <th className="pb-3 font-medium">Location</th>
            <th className="pb-3 font-medium">Distance</th>
            <th className="pb-3 font-medium">Priority</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Reported</th>
            <th className="pb-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c._id} className="border-t border-slate-100">
              <td className="py-3 font-semibold text-slate-800">{c.complaintId}</td>
              <td className="py-3 text-slate-600">{c.category}</td>
              <td className="py-3 text-slate-600">{c.citizen?.fullName}</td>
              <td className="max-w-[180px] truncate py-3 text-slate-600">{c.location?.address}</td>
              <td className="py-3 text-slate-500">{c.distanceKm != null ? `${c.distanceKm.toFixed(1)} km` : "—"}</td>
              <td className="py-3">
                <PriorityBadge priority={c.priority} />
              </td>
              <td className="py-3">
                <StatusBadge status={c.status} />
              </td>
              <td className="py-3 text-slate-500">
                {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </td>
              <td className="py-3">
                <div className="flex gap-2">
                  <button onClick={() => navigate(`${base}/complaints/${c._id}`)} className="btn-secondary px-4 py-1.5 text-xs">
                    View
                  </button>
                  {c.location?.lat && c.location?.lng && (
                    <a
                      href={getDirectionsUrl(c.location.lat, c.location.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Get directions in Google Maps"
                      className="btn-secondary px-3 py-1.5 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Navigation2 className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {showAccept && !c.assignedOfficer && (
                    <button onClick={() => onAccept(c._id)} className="btn-primary px-4 py-1.5 text-xs">
                      Accept
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="py-8 text-center text-slate-400">
                Nothing here right now.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
