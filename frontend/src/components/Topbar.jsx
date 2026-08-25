import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Topbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [search, setSearch] = useState("");
  const base = user?.role === "officer" ? "/officer" : "/citizen";

  useEffect(() => {
    let mounted = true;
    api
      .get("/notifications")
      .then(({ data }) => mounted && setUnread(data.unreadCount))
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  const initials = (user?.fullName || "Guest")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`${base}/complaints?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="flex h-[73px] flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
      <form onSubmit={handleSearch} className="w-full max-w-xs">
        <div className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaint ID, category..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </form>

      <div className="flex items-center gap-5">
        <button
          onClick={() => navigate(`${base}/notifications`)}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate(`${base}/profile`)}
          className="flex items-center gap-2 rounded-full pr-1"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {initials}
          </span>
          <span className="text-sm font-semibold text-slate-700">{user?.fullName?.split(" ")[0] || "Guest"}</span>
        </button>
      </div>
    </header>
  );
}
