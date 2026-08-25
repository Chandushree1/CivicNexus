import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, CheckCircle2, Upload } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { StatusBadge, PriorityBadge } from "../../components/Badges";
import { CategoryIcon } from "../../components/categories";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const STATUS_OPTIONS = ["Under Review", "Assigned", "In Progress"];

export default function OfficerComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [note, setNote] = useState("");
  const [statusChoice, setStatusChoice] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get(`/complaints/${id}`).then(({ data }) => setComplaint(data.complaint));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isMine = complaint?.assignedOfficer?._id === user?._id;

  const accept = async () => {
    setSaving(true);
    await api.patch(`/complaints/${id}/accept`);
    await load();
    setSaving(false);
  };

  const updateStatus = async () => {
    if (!statusChoice) return;
    setSaving(true);
    await api.patch(`/complaints/${id}/status`, { status: statusChoice, note });
    setNote("");
    setStatusChoice("");
    await load();
    setSaving(false);
  };

  const resolve = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append("note", resolutionNote);
    if (resolutionPhoto) fd.append("resolutionPhoto", resolutionPhoto);
    await api.patch(`/complaints/${id}/resolve`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    await load();
    setSaving(false);
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
          <p className="mt-4 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-4 w-4" /> {complaint.location?.address}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Citizen: {complaint.citizen?.fullName} · {complaint.citizen?.phone}
          </p>

          {complaint.photos?.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {complaint.photos.map((p, i) => (
                <img key={i} src={p.url} alt="" className="h-28 w-full rounded-xl object-cover" />
              ))}
            </div>
          )}

          {complaint.status !== "Resolved" && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              {!complaint.assignedOfficer ? (
                <button onClick={accept} disabled={saving} className="btn-primary">
                  Accept this case
                </button>
              ) : isMine ? (
                <>
                  <p className="mb-2 font-bold text-slate-900">Update status</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <select className="input max-w-[220px]" value={statusChoice} onChange={(e) => setStatusChoice(e.target.value)}>
                      <option value="">Select new status</option>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <input
                      className="input max-w-sm"
                      placeholder="Field note (optional)"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <button onClick={updateStatus} disabled={saving || !statusChoice} className="btn-secondary">
                      Update
                    </button>
                  </div>

                  <p className="mb-2 mt-6 font-bold text-slate-900">Mark resolved</p>
                  <textarea
                    className="input mb-3"
                    placeholder="Resolution note"
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                  />
                  <label className="btn-secondary mb-3 inline-flex cursor-pointer">
                    <Upload className="h-4 w-4" /> {resolutionPhoto ? resolutionPhoto.name : "Upload resolution photo"}
                    <input type="file" accept="image/*" hidden onChange={(e) => setResolutionPhoto(e.target.files[0])} />
                  </label>
                  <div>
                    <button onClick={resolve} disabled={saving} className="btn-primary">
                      <CheckCircle2 className="h-4 w-4" /> Mark as resolved
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">This case is assigned to another officer.</p>
              )}
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
              {complaint.rating && (
                <p className="mt-3 text-sm font-semibold text-green-800">Citizen rated this {complaint.rating} / 5 stars.</p>
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
        </div>
      </div>
    </DashboardLayout>
  );
}
