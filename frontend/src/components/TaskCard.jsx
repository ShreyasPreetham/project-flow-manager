import { useState } from "react";

const PRIORITY_STYLES = {
  Low:      { badge: "bg-slate-100 text-slate-500",   dot: "bg-slate-400"  },
  Medium:   { badge: "bg-blue-100 text-blue-600",     dot: "bg-blue-400"   },
  High:     { badge: "bg-orange-100 text-orange-600", dot: "bg-orange-400" },
  Critical: { badge: "bg-red-100 text-red-600",       dot: "bg-red-500"    },
};

function isDueSoon(dateStr) {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  const now = new Date();
  const diff = (due - now) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 2;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function TaskCard({ task, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;
  const overdue = isOverdue(task.due_date);
  const dueSoon = !overdue && isDueSoon(task.due_date);

  const handleDelete = async () => {
    setDeleting(true);
    try { await onDelete(); }
    finally { setDeleting(false); setConfirmDelete(false); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      {/* Priority indicator bar */}
      <div className={`h-0.5 w-full rounded-full mb-3 ${priority.dot}`} />

      {/* Title + priority badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 flex-1">
          {task.title}
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${priority.badge}`}>
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Due date */}
      {task.due_date && (
        <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md mb-3 font-medium
          ${overdue ? "bg-red-50 text-red-600" : dueSoon ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-500"}`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {overdue ? "Overdue · " : dueSoon ? "Due soon · " : ""}
          {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      )}

      {/* Assignee */}
      {task.assignee && (
        <div className="mb-3 inline-flex items-center gap-2 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
          <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-[10px] font-bold">
            {task.assignee.charAt(0).toUpperCase()}
          </span>
          <span className="max-w-[170px] truncate" title={task.assignee}>
            {task.assignee}
          </span>
        </div>
      )}

      {/* Actions */}
      {!confirmDelete ? (
        <div className="flex gap-2">
          <button onClick={onEdit}
            className="flex-1 text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-200
                       text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition">
            Edit
          </button>
          <button onClick={() => setConfirmDelete(true)}
            className="flex-1 text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-200
                       text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition">
            Delete
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 text-xs font-medium py-1.5 px-3 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition">
            {deleting ? "Deleting…" : "Confirm"}
          </button>
          <button onClick={() => setConfirmDelete(false)}
            className="flex-1 text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
