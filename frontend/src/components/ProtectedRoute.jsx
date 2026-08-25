import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-400">Loading...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;

  const allowedRoles = role ? (Array.isArray(role) ? role : [role]) : ["citizen", "officer", "admin"];
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "citizen" ? "/citizen/dashboard" : "/officer/dashboard"} replace />;
  }
  return children;
}
