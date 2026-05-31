import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TYPE_STYLES = {
  Software: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400", badge: "bg-violet-100 text-violet-700" },
  Business: { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400",   badge: "bg-blue-100 text-blue-700"   },
  Personal: { bg: "bg-emerald-50",text: "text-emerald-700",dot: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-700" },
};

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const style = TYPE_STYLES[project.project_type] || TYPE_STYLES.Software;
  const progress = project.task_count > 0
    ? Math.round((project.done_count / project.task_count) * 100)
    : 0;

  const handleDelete = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    try { await onDelete(); }
    finally { setDeleting(false); setConfirmDelete(false); }
  };

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md
                 hover:border-blue-200 transition cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-lg font-bold ${style.text}`}>
            {project.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${style.badge}`}>
          {project.project_type}
        </span>
      </div>

      {/* Name + description */}
      <h3 className="font-bold text-slate-800 text-base mb-1 line-clamp-1 group-hover:text-blue-700 transition">
        {project.name}
      </h3>
      {project.description && (
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
          {project.description}
        </p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          {project.todo_count} Todo
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          {project.in_progress_count} In Progress
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          {project.done_count} Done
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      {!confirmDelete ? (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="flex-1 text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-200
                       text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
            className="flex-1 text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-200
                       text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
          >
            Delete
          </button>
        </div>
      ) : (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 text-xs font-medium py-1.5 px-3 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition">
            {deleting ? "Deleting…" : "Confirm"}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
            className="flex-1 text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
