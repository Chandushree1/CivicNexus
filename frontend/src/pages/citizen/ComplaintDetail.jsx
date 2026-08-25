import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star, CheckCircle2 } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { StatusBadge, PriorityBadge } from "../../components/Badges";
import { CategoryIcon } from "../../components/categories";
import api from "../../api/axios";

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => api.get(`/complaints/${id}`).then(({ data }) => setComplaint(data.complaint));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitRating = async () => {
    setSaving(true);
    try {
      await api.patch(`/complaints/${id}/rate`, { rating, comment });
      load();
    } finally {
      setSaving(false);
    }
  };

  if (!complaint) {
    return (
      <DashboardLayout>
        <p className="text-slate-400">Loading complaint...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <CategoryIcon category={complaint.category} className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-slate-500">{complaint.complaintId}</span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{complaint.title}</h1>
          <p className="mt-2 text-slate-600">{complaint.description}</p>
          {complaint.additionalDetails && <p className="mt-2 text-sm text-slate-400">{complaint.additionalDetails}</p>}
          <p className="mt-4 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-4 w-4" /> {complaint.location?.address}
          </p>

          {complaint.photos?.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {complaint.photos.map((p, i) => (
                <img key={i} src={p.url} alt="" className="h-28 w-full rounded-xl object-cover" />
              ))}
            </div>
          )}

          {complaint.status === "Resolved" && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
              <p className="flex items-center gap-2 font-bold text-green-700">
                <CheckCircle2 className="h-5 w-5" /> Resolved
              </p>
              {complaint.resolution?.note && <p className="mt-2 text-sm text-green-800">{complaint.resolution.note}</p>}
              {complaint.resolution?.photoUrl && (
                <img src={complaint.resolution.photoUrl} alt="Resolution" className="mt-3 h-40 rounded-xl object-cover" />
              )}

              {complaint.rating ? (
                <p className="mt-4 text-sm font-semibold text-green-800">
                  You rated this resolution {complaint.rating} / 5 stars.
                </p>
              ) : (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold text-slate-700">Rate this resolution</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRating(n)}>
                        <Star className={`h-6 w-6 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="input mt-3"
                    placeholder="Optional comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button onClick={submitRating} disabled={!rating || saving} className="btn-primary mt-3">
                    {saving ? "Submitting..." : "Submit rating"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card h-fit">
          <p className="mb-4 font-bold text-slate-900">Timeline</p>
          <div className="space-y-5">
            {complaint.timeline?.map((t, i) => (
              <div key={i} className="relative pl-6">
                <span className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full bg-brand-600" />
                {i < complaint.timeline.length - 1 && (
                  <span className="absolute left-[4px] top-4 h-full w-px bg-slate-200" />
                )}
                <p className="text-sm font-semibold text-slate-800">{t.status}</p>
                {t.note && <p className="text-sm text-slate-500">{t.note}</p>}
                <p className="mt-0.5 text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {complaint.assignedOfficer && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Assigned officer</p>
              <p className="mt-1 font-semibold text-slate-800">{complaint.assignedOfficer.fullName}</p>
              <p className="text-sm text-slate-500">{complaint.assignedOfficer.designation}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
