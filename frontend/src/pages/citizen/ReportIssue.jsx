import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Upload, X, MapPin, Loader2 } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { CATEGORIES } from "../../components/categories";
import { PriorityBadge, StatusBadge } from "../../components/Badges";
import api from "../../api/axios";

const STEPS = ["Issue details", "Upload evidence", "Location", "Review"];

export default function ReportIssue() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    priority: "Medium",
    additionalDetails: "",
    address: "",
    ward: "",
    lat: "",
    lng: "",
  });
  const [files, setFiles] = useState([]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 5 - files.length);
    setFiles((f) => [...f, ...selected].slice(0, 5));
  };

  const removeFile = (idx) => setFiles((f) => f.filter((_, i) => i !== idx));

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update({
          lat: pos.coords.latitude.toFixed(4),
          lng: pos.coords.longitude.toFixed(4),
          address: form.address || "Current device location",
        });
      },
      () => {
        // fall back to a Bengaluru default so the flow isn't blocked
        update({ lat: "12.9352", lng: "77.6245" });
      }
    );
  };

  const canContinue = () => {
    if (step === 0) return form.category && form.title && form.description;
    if (step === 2) return form.address && form.lat && form.lng;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append("photos", f));
      const { data } = await api.post("/complaints", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/citizen/complaints/${data.complaint._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-extrabold text-slate-900">Report an issue</h1>
      <p className="mt-1 text-slate-500">Four short steps. Photo and location proof help officers act faster.</p>

      <div className="card mt-6">
        <div className="mb-8 flex flex-wrap items-center gap-6 border-b border-slate-100 pb-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                  i === step ? "bg-brand-600 text-white" : i < step ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {i + 1}
              </span>
              <span className={`text-sm font-medium ${i === step ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="label">Issue category</label>
              <select className="input" value={form.category} onChange={(e) => update({ category: e.target.value })}>
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Issue title</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="e.g. Garbage not collected for 6 days near 5th Block park"
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-[120px]"
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="What is the problem, how long has it been there and who is affected?"
              />
              <p className="mt-1 text-xs text-slate-400">{form.description.length} characters</p>
            </div>
            <div>
              <label className="label">Priority</label>
              <div className="flex flex-wrap gap-2">
                {["Low", "Medium", "High", "Urgent"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => update({ priority: p })}
                    className={`rounded-full border px-5 py-1.5 text-sm font-semibold transition ${
                      form.priority === p ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Additional details (optional)</label>
              <textarea
                className="input min-h-[90px]"
                value={form.additionalDetails}
                onChange={(e) => update({ additionalDetails: e.target.value })}
                placeholder="Nearby landmark, best time to visit, contact person..."
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <label className="label">Upload photos (up to 5)</label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-12 text-slate-400 hover:border-brand-400 hover:text-brand-500">
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">Click to upload or drag and drop</span>
              <span className="text-xs">JPG, PNG or WEBP — up to 8MB each</span>
              <input type="file" accept="image/*" multiple hidden onChange={handleFiles} />
            </label>
            {files.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {files.map((f, i) => (
                  <div key={i} className="relative overflow-hidden rounded-xl border border-slate-200">
                    <img src={URL.createObjectURL(f)} alt="" className="h-28 w-full object-cover" />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <button type="button" onClick={useMyLocation} className="btn-secondary">
              <MapPin className="h-4 w-4" /> Use my current location
            </button>
            <div>
              <label className="label">Address</label>
              <textarea
                className="input min-h-[80px]"
                value={form.address}
                onChange={(e) => update({ address: e.target.value })}
                placeholder="Street, locality, landmark"
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label className="label">Latitude</label>
                <input className="input" value={form.lat} onChange={(e) => update({ lat: e.target.value })} placeholder="12.9352" />
              </div>
              <div>
                <label className="label">Longitude</label>
                <input className="input" value={form.lng} onChange={(e) => update({ lng: e.target.value })} placeholder="77.6245" />
              </div>
              <div>
                <label className="label">Ward (optional)</label>
                <input className="input" value={form.ward} onChange={(e) => update({ ward: e.target.value })} placeholder="Ward 84" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="badge bg-brand-50 text-brand-700">{form.category || "—"}</span>
                <PriorityBadge priority={form.priority} />
                <StatusBadge status="Submitted" />
              </div>
              <p className="text-lg font-bold text-slate-900">{form.title || "Untitled issue"}</p>
              <p className="mt-1 text-sm text-slate-600">{form.description}</p>
              {form.additionalDetails && <p className="mt-1 text-sm text-slate-400">{form.additionalDetails}</p>}
              <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-4 w-4" /> {form.address} {form.ward && `· ${form.ward}`}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {form.lat}, {form.lng}
              </p>
              {files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {files.map((f, i) => (
                    <img key={i} src={URL.createObjectURL(f)} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <button
            onClick={() => (step === 0 ? navigate(-1) : setStep((s) => s - 1))}
            className="btn-secondary"
            disabled={submitting}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < 3 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canContinue()} className="btn-primary">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? "Submitting..." : "Submit complaint"}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
