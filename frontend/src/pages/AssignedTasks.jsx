import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const PRIORITY_STYLES = {
  Low:      { badge: "bg-slate-100 text-slate-600",   dot: "bg-slate-400"  },
  Medium:   { badge: "bg-blue-100 text-blue-600",     dot: "bg-blue-400"   },
  High:     { badge: "bg-orange-100 text-orange-600", dot: "bg-orange-400" },
  Critical: { badge: "bg-red-100 text-red-600",       dot: "bg-red-500"    },
};

const STAGE_STYLES = {
  "To Do":       { badge: "bg-slate-100 text-slate-600",  dot: "bg-slate-400"  },
  "In Progress": { badge: "bg-amber-100 text-amber-700",  dot: "bg-amber-400"  },
  "Done":        { badge: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
};

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function isDueSoon(dateStr) {
  if (!dateStr) return false;
  const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 2;
}

const STAGE_FILTERS = ["All", "To Do", "In Progress", "Done"];
const PRIORITY_FILTERS = ["All", "Critical", "High", "Medium", "Low"];

export default function AssignedTasks() {
  const { user } = useAuth();
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [stageFilter, setStage]   = useState("All");
  const [priorityFilter, setPriority] = useState("All");

  const fetchTasks = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/assigned-tasks/");
      setTasks(res.data);
    } catch {
      setError("Failed to load your assigned tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const visible = tasks.filter((t) => {
    const matchStage    = stageFilter === "All"    || t.stage === stageFilter;
    const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
    return matchStage && matchPriority;
  });

  // ── Group by project ──────────────────────────────────────────────────────
  const byProject = visible.reduce((acc, task) => {
    const key = task.project_name || "Unknown Project";
    const pid = task.project;
    if (!acc[key]) acc[key] = { id: pid, tasks: [] };
    acc[key].tasks.push(task);
    return acc;
  }, {});

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalOverdue = tasks.filter(
    (t) => isOverdue(t.due_date) && t.stage !== "Done"
  ).length;
  const totalDone = tasks.filter((t) => t.stage === "Done").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Assigned to Me</h1>
          <p className="text-slate-500 text-sm mt-1">
            Tasks assigned to <span className="font-medium text-slate-700">{user?.email}</span>
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Assigned", value: tasks.length,  color: "text-blue-600",  bg: "bg-blue-50"  },
            { label: "To Do",          value: tasks.filter(t => t.stage === "To Do").length,        color: "text-slate-700", bg: "bg-slate-100" },
            { label: "In Progress",    value: tasks.filter(t => t.stage === "In Progress").length,  color: "text-amber-600", bg: "bg-amber-50"  },
            { label: "Completed",      value: totalDone,      color: "text-green-600", bg: "bg-green-50" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4`}>
              <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Overdue banner */}
        {totalOverdue > 0 && (
          <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200
                          rounded-xl text-red-700 text-sm font-medium">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            {totalOverdue} overdue task{totalOverdue > 1 ? "s" : ""} — please review
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-500">Stage:</span>
            {STAGE_FILTERS.map((s) => (
              <button key={s} onClick={() => setStage(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition
                  ${stageFilter === s
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-500">Priority:</span>
            {PRIORITY_FILTERS.map((p) => (
              <button key={p} onClick={() => setPriority(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition
                  ${priorityFilter === p
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-32 mb-3" />
                <div className="h-5 bg-slate-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-semibold mb-1">No tasks assigned to you</p>
            <p className="text-sm">
              {stageFilter !== "All" || priorityFilter !== "All"
                ? "Try clearing your filters."
                : "Tasks assigned to your email will appear here."}
            </p>
          </div>
        ) : (
          /* Task list grouped by project */
          <div className="space-y-6">
            {Object.entries(byProject).map(([projectName, { id: projectId, tasks: projectTasks }]) => (
              <div key={projectName}>
                {/* Project group header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 text-xs font-bold">
                      {projectName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <Link
                    to={`/projects/${projectId}`}
                    className="font-semibold text-slate-700 hover:text-blue-600 transition text-sm"
                  >
                    {projectName}
                  </Link>
                  <span className="text-xs text-slate-400 font-medium">
                    {projectTasks.length} task{projectTasks.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Task cards */}
                <div className="space-y-3 pl-10">
                  {projectTasks.map((task) => {
                    const ps = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;
                    const ss = STAGE_STYLES[task.stage]       || STAGE_STYLES["To Do"];
                    const overdue  = isOverdue(task.due_date) && task.stage !== "Done";
                    const dueSoon  = !overdue && isDueSoon(task.due_date);

                    return (
                      <div key={task.id}
                        className="bg-white border border-slate-200 rounded-xl p-4
                                   hover:shadow-md hover:border-blue-200 transition">

                        {/* Title row */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-semibold text-slate-800 text-sm leading-snug flex-1">
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ps.badge}`}>
                              {task.priority}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ss.badge}`}>
                              {task.stage}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-2">
                            {task.description}
                          </p>
                        )}

                        {/* Footer row */}
                        <div className="flex items-center justify-between gap-2 mt-2">
                          {/* Due date */}
                          {task.due_date ? (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5
                              rounded-md font-medium
                              ${overdue  ? "bg-red-50 text-red-600"
                              : dueSoon  ? "bg-amber-50 text-amber-600"
                              :            "bg-slate-50 text-slate-500"}`}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {overdue ? "Overdue · " : dueSoon ? "Due soon · " : ""}
                              {new Date(task.due_date).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric"
                              })}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">No due date</span>
                          )}

                          {/* View in project link */}
                          <Link
                            to={`/projects/${projectId}`}
                            className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
                          >
                            View in project
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
