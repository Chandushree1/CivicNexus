import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import ComplaintTable from "../../components/ComplaintTable";
import MockMap from "../../components/MockMap";
import api from "../../api/axios";

export default function NearbyIssues() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  const load = () => api.get("/complaints/nearby").then(({ data }) => setItems(data.items));

  useEffect(() => {
    load();
  }, []);

  const accept = async (id) => {
    await api.patch(`/complaints/${id}/accept`);
    load();
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-extrabold text-slate-900">Nearby issues</h1>
      <p className="mt-1 text-slate-500">Complaints within your ward radius, closest first.</p>

      <div className="mt-6">
        {items.length > 0 && (
          <MockMap items={items} mode="distance" caption="Open complaints near you (mock positions)" />
        )}
      </div>

      <div className="card mt-6">
        <ComplaintTable rows={items} navigate={navigate} base="/officer" onAccept={accept} showAccept />
      </div>
    </DashboardLayout>
  );
}
