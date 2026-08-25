import { useEffect, useState } from "react";
import { UserPlus, Pencil, Trash2, X } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { CATEGORIES } from "../../components/categories";
import api from "../../api/axios";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  designation: "",
  department: "",
  ward: "",
};

export default function ManageOfficers() {
  const [officers, setOfficers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/admin/officers").then(({ data }) => setOfficers(data.officers));

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (o) => {
    setForm({
      fullName: o.fullName,
      email: o.email,
      phone: o.phone || "",
      password: "",
      designation: o.designation || "",
      department: o.department || "",
      ward: o.ward || "",
    });
    setEditingId(o._id);
    setError("");
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/officers/${editingId}`, form);
      } else {
        await api.post("/admin/officers", form);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save officer");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (o) => {
    await api.put(`/admin/officers/${o._id}`, { isActive: !o.isActive });
    load();
  };

  const remove = async (o) => {
    if (!confirm(`Remove ${o.fullName}? This can't be undone.`)) return;
    try {
      await api.delete(`/admin/officers/${o._id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not remove officer");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Manage officers</h1>
          <p className="mt-1 text-slate-500">{officers.length} officer(s) across all departments.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <UserPlus className="h-4 w-4" /> Add officer
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-bold text-slate-900">{editingId ? "Edit officer" : "New officer account"}</p>
            <button onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="label">Full name</label>
              <input className="input" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                required
                disabled={!!editingId}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            {!editingId && (
              <div>
                <label className="label">Temporary password</label>
                <input
                  type="password"
                  className="input"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="label">Designation</label>
              <input
                className="input"
                placeholder="e.g. Junior Engineer"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Department</label>
              <select className="input" required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select department</option>
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Ward</label>
              <input
                className="input"
                placeholder="e.g. Ward 84, Koramangala"
                value={form.ward}
                onChange={(e) => setForm({ ...form, ward: e.target.value })}
              />
            </div>

            {error && <p className="text-sm font-medium text-red-600 sm:col-span-2">{error}</p>}

            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Saving..." : editingId ? "Save changes" : "Create officer"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Department</th>
                <th className="pb-3 font-medium">Ward</th>
                <th className="pb-3 font-medium">Assigned</th>
                <th className="pb-3 font-medium">Resolved</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((o) => (
                <tr key={o._id} className="border-t border-slate-100">
                  <td className="py-3">
                    <p className="font-semibold text-slate-800">{o.fullName}</p>
                    <p className="text-xs text-slate-400">{o.email}</p>
                  </td>
                  <td className="py-3 text-slate-600">{o.department}</td>
                  <td className="py-3 text-slate-600">{o.ward || "—"}</td>
                  <td className="py-3 text-slate-600">{o.assignedCount}</td>
                  <td className="py-3 text-slate-600">{o.resolvedCount}</td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleActive(o)}
                      className={`badge ${o.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {o.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(o)} className="btn-secondary px-3 py-1.5 text-xs">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => remove(o)} className="btn-secondary px-3 py-1.5 text-xs text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {officers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No officers yet. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
