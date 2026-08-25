import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import ComplaintTable from "../../components/ComplaintTable";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function AssignedComplaints() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    api.get("/complaints/assigned").then(({ data }) => setComplaints(data.complaints));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-extrabold text-slate-900">Assigned complaints</h1>
      <p className="mt-1 text-slate-500">
        {complaints.length} case(s) assigned to {user?.fullName}
      </p>

      <div className="card mt-6">
        <ComplaintTable rows={complaints} navigate={navigate} base="/officer" />
      </div>
    </DashboardLayout>
  );
}
