import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Smartphone, MapPin, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("citizen");
  const [email, setEmail] = useState("ananya.sharma@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (r) => {
    setRole(r);
    setEmail(
      r === "citizen"
        ? "ananya.sharma@gmail.com"
        : r === "officer"
        ? "ramesh.iyer@civicconnect.gov.in"
        : "admin@civicconnect.gov.in"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password, role);
      navigate(user.role === "officer" || user.role === "admin" ? "/officer/dashboard" : "/citizen/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left panel */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-10 md:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold leading-tight text-slate-900">CivicConnect</p>
            <p className="text-[10px] font-semibold tracking-wide text-slate-400">CITIZEN GRIEVANCE PORTAL</p>
          </div>
        </div>

        <div className="mx-auto flex h-[380px] w-full max-w-md items-center justify-center rounded-3xl bg-white shadow-sm">
          <div className="relative flex h-72 w-40 flex-col items-center justify-center gap-3 rounded-[2rem] border-4 border-slate-800 p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <Smartphone className="h-6 w-6" />
            </span>
            <div className="h-2 w-full rounded bg-slate-100" />
            <div className="h-2 w-full rounded bg-slate-100" />
            <div className="h-2 w-2/3 rounded bg-slate-100" />
            <div className="mt-2 h-8 w-full rounded-full bg-green-500" />
            <MapPin className="absolute -left-8 bottom-10 h-8 w-8 text-brand-500" />
            <span className="absolute -right-6 bottom-8 flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">One account, full visibility</h2>
          <p className="mt-2 max-w-sm text-slate-500">
            Track every complaint you have raised, see which officer is working on it and rate the resolution
            once the work is done.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-extrabold text-slate-900">Sign in</h1>
          <p className="mt-2 text-slate-500">
            Use the demo credentials below, or pick another role to explore those dashboards.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="label">Email or phone number</label>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-11"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123 (demo)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Sign in as</label>
              <div className="grid grid-cols-3 gap-2">
                {["citizen", "officer", "admin"].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${
                      role === r
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                Remember me
              </label>
              <span className="font-semibold text-brand-600">Forgot password?</span>
            </div>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            New to CivicConnect?{" "}
            <Link to="/register" className="font-semibold text-brand-600">
              Create an account
            </Link>
          </p>
          <Link to="/" className="mt-2 inline-block text-sm text-slate-400">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
