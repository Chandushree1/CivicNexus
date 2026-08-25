import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "Bengaluru",
  });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agree) {
      setError("Please agree to the terms of use to continue");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate("/citizen/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold leading-tight text-slate-900">CivicConnect</p>
            <p className="text-[10px] font-semibold tracking-wide text-slate-400">CITIZEN GRIEVANCE PORTAL</p>
          </div>
        </div>

        <div className="card">
          <h1 className="text-3xl font-extrabold text-slate-900">Create your account</h1>
          <p className="mt-2 text-slate-500">
            Citizens register here. Officers and administrators receive credentials from their municipal body.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="label">Full name</label>
              <input
                className="input"
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                placeholder="e.g. Ananya Sharma"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="label">Phone number</label>
                <input
                  className="input"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input
                  className="input"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={onChange}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Address</label>
              <textarea
                className="input min-h-[90px]"
                name="address"
                value={form.address}
                onChange={onChange}
                placeholder="Flat / house number, street, locality"
              />
            </div>

            <div>
              <label className="label">City</label>
              <input className="input" name="city" value={form.city} onChange={onChange} />
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4 rounded-full border-slate-300 text-brand-600"
              />
              I agree to the CivicConnect terms of use and consent to my complaint details being shared with
              the assigned municipal officer.
            </label>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-brand-600">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
