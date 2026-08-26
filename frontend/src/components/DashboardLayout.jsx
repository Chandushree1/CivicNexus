import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
// import Chatbot from "./Chatbot";?
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-10 py-8">{children}</main>
      </div>
      {/* Filing complaints via chat only makes sense for citizen accounts, but the
          assistant can still answer general questions for officers/admins too. */}
      {/* {user?.role === "citizen" && <Chatbot />} */}
    </div>
  );
}
