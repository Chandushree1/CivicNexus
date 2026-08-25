import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { CategoryIcon } from "../../components/categories";

import api from "../../api/axios";

function Bar({ percent, colorClass = "bg-brand-600" }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
  );
}

export default function Analytics() {
  const [wards, setWards] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/admin/analytics/wards").then(({ data }) => setWards(data.wards));
    api.get("/admin/analytics/categories").then(({ data }) => setCategories(data.categories));
  }, []);

  const maxCategoryTotal = Math.max(1, ...categories.map((c) => c.total));

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-extrabold text-slate-900">Analytics</h1>
      <p className="mt-1 text-slate-500">Ward-level resolution rates, overdue counts and category breakdowns.</p>

      <div className="card mt-6">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Ward performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="pb-3 font-medium">Ward</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Resolved</th>
                <th className="pb-3 font-medium">Overdue</th>
                <th className="pb-3 font-medium">Resolution rate</th>
              </tr>
            </thead>
            <tbody>
              {wards.map((w) => (
                <tr key={w.ward} className="border-t border-slate-100">
                  <td className="py-3 font-semibold text-slate-800">{w.ward}</td>
                  <td className="py-3 text-slate-600">{w.total}</td>
                  <td className="py-3 text-slate-600">{w.resolved}</td>
                  <td className="py-3">
                    <span className={w.overdue > 0 ? "font-semibold text-red-500" : "text-slate-400"}>{w.overdue}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <Bar percent={w.resolutionRate} colorClass={w.resolutionRate >= 70 ? "bg-green-500" : "bg-amber-500"} />
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{w.resolutionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {wards.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No ward data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Complaints by category</h2>
        <div className="space-y-4">
          {categories.map((c) => (
            <div key={c.category} className="flex items-center gap-4">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <CategoryIcon category={c.category} className="h-4 w-4" />
              </span>
              <div className="w-40 flex-shrink-0 text-sm font-medium text-slate-700">{c.category}</div>
              <div className="flex-1">
                <Bar percent={(c.total / maxCategoryTotal) * 100} />
              </div>
              <div className="w-28 flex-shrink-0 text-right text-sm text-slate-500">
                {c.resolved}/{c.total} resolved
              </div>
            </div>
          ))}
          {categories.length === 0 && <p className="py-8 text-center text-slate-400">No category data yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
