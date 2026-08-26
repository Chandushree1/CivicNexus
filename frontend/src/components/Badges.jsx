const statusStyles = {
  Submitted: "bg-slate-100 text-slate-600",
  "Under Review": "bg-sky-100 text-sky-700",
  Assigned: "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-green-100 text-green-700",
};

const priorityStyles = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-amber-100 text-amber-700",
  Urgent: "bg-red-100 text-red-600",
};

const statusDot = {
  Submitted: "bg-slate-400",
  "Under Review": "bg-sky-500",
  Assigned: "bg-blue-500",
  "In Progress": "bg-amber-500",
  Resolved: "bg-green-500",
};

export function StatusBadge({ status }) {
  return (
    <span className={`badge ${statusStyles[status] || "bg-slate-100 text-slate-600"}`}>
      {status !== "Resolved" && <span className={`h-1.5 w-1.5 rounded-full ${statusDot[status] || "bg-slate-400"}`} />}
      {status === "Resolved" && <span className="text-green-600">●</span>}
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const level =
    typeof priority === "object"
      ? priority?.level
      : priority;

  return (
    <span
      className={`badge ${
        priorityStyles[level] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {level || "Unknown"}
    </span>
  );
}
