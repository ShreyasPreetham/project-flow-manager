import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import ProjectForm from "../components/ProjectForm";
import api from "../services/api";

const TYPE_FILTERS = ["All", "Software", "Business", "Personal"];

const PRIORITY_STYLES = {
  Low:      "bg-slate-100 text-slate-600",
  Medium:   "bg-blue-100 text-blue-600",
  High:     "bg-orange-100 text-orange-600",
  Critical: "bg-red-100 text-red-600",
};

const STAGE_STYLES = {
  "To Do":       "bg-slate-100 text-slate-600",
  "In Progress": "bg-amber-100 text-amber-700",
  "Done":        "bg-green-100 text-green-700",
};

function isOverdue(d) {
  return d && new Date(d) < new Date();
}

export default function Home() {
  const { user, displayName } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects]       = useState([]);
  const [assignedTasks, setAssigned]  = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [editingProject, setEditing]  = useState(null);
  const [filter, setFilter]           = useState("All");
  const [search, setSearch]           = useState("");

  // ── Fetch both projects AND assigned tasks in parallel ────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [projRes, assignedRes] = await Promise.all([
        api.get("/projects/"),
        api.get("/assigned-tasks/"),
      ]);
      setProjects(projRes.data);
      setAssigned(assignedRes.data);
    } catch {
      setError("Failed to load data. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Project CRUD ──────────────────────────────────────────────────────────
  const handleCreate = async (data) => {
    const res = await api.post("/projects/", data);
    setProjects((p) => [res.data, ...p]);
  };
  const handleUpdate = async (id, data) => {
    const res = await api.put(`/projects/${id}/`, data);
    setProjects((p) => p.map((proj) => (proj.id === id ? res.data : proj)));
  };
  const handleDelete = async (id) => {
    await api.delete(`/projects/${id}/`);
    setProjects((p) => p.filter((proj) => proj.id !== id));
  };
  const handleFormSubmit = async (data) => {
    if (editingProject) await handleUpdate(editingProject.id, data);
    else await handleCreate(data);
    setShowForm(false); setEditing(null);
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = {
    projects:   projects.length,
    tasks:      projects.reduce((s, p) => s + p.task_count, 0),
    inProgress: projects.reduce((s, p) => s + p.in_progress_count, 0),
    done:       projects.reduce((s, p) => s + p.done_count, 0),
  };

  // Assigned tasks — show all (including done)
  const pendingAssigned = assignedTasks.filter((t) => t.stage !== "Done");
  const overdueAssigned = pendingAssigned.filter((t) => isOverdue(t.due_date));

  // Show the assigned section if user has ANY assigned tasks
  const showAssignedSection = assignedTasks.length > 0;

  // ── Filtered projects ─────────────────────────────────────────────────────
  const visible = projects.filter((p) => {
    const matchType   = filter === "All" || p.project_type === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {displayName || user?.username} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here's an overview of all your projects and assigned tasks.
          </p>
        </div>

        {/* ── ASSIGNED TASKS BANNER — shown when user has tasks assigned to them ── */}
        {!loading && showAssignedSection && (
          <div className="mb-8 bg-white border border-blue-200 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">Tasks Assigned to You</h2>
                  <p className="text-xs text-slate-500">
                    {assignedTasks.length} task{assignedTasks.length !== 1 ? "s" : ""}
                    {" · "}{pendingAssigned.length} pending
                    {overdueAssigned.length > 0 && (
                      <span className="ml-2 text-red-600 font-medium">
                        · {overdueAssigned.length} overdue
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Link
                to="/assigned"
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                View all
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Task rows — show up to 5 */}
            <div className="divide-y divide-slate-100">
              {assignedTasks.slice(0, 5).map((task) => {
                const overdue = isOverdue(task.due_date) && task.stage !== "Done";
                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/projects/${task.project}`)}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50
                               cursor-pointer transition"
                  >
                    {/* Priority dot */}
                    <span className={`w-2 h-2 rounded-full flex-shrink-0
                      ${task.priority === "Critical" ? "bg-red-500"
                      : task.priority === "High"     ? "bg-orange-400"
                      : task.priority === "Medium"   ? "bg-blue-400"
                      :                                "bg-slate-400"}`}
                    />

                    {/* Title + project */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate
                        ${task.stage === "Done" ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {task.project_name}
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${STAGE_STYLES[task.stage] || STAGE_STYLES["To Do"]}`}>
                        {task.stage}
                      </span>
                    </div>

                    {/* Due date */}
                    {task.due_date && (
                      <span className={`text-xs font-medium flex-shrink-0
                        ${overdue ? "text-red-600" : "text-slate-400"}`}>
                        {overdue ? "⚠ " : ""}
                        {new Date(task.due_date).toLocaleDateString("en-US", {
                          month: "short", day: "numeric"
                        })}
                      </span>
                    )}

                    {/* Arrow */}
                    <svg className="w-4 h-4 text-slate-300 flex-shrink-0"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                );
              })}
            </div>

            {/* Footer — if more than 5 */}
            {assignedTasks.length > 5 && (
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center">
                <Link to="/assigned"
                  className="text-xs text-blue-600 font-semibold hover:underline">
                  + {assignedTasks.length - 5} more — View all assigned tasks
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── PROJECT STATS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Projects", value: stats.projects,   color: "text-blue-600",  bg: "bg-blue-50"  },
            { label: "Total Tasks",    value: stats.tasks,      color: "text-slate-700", bg: "bg-slate-100"},
            { label: "In Progress",    value: stats.inProgress, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Completed",      value: stats.done,       color: "text-green-600", bg: "bg-green-50" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4`}>
              <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── TOOLBAR ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects…"
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>
            <div className="flex gap-1">
              {TYPE_FILTERS.map((t) => (
                <button key={t} onClick={() => setFilter(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition
                    ${filter === t
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                       text-white text-sm font-semibold rounded-lg transition shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* ── PROJECTS SECTION LABEL ── */}
        <h2 className="text-base font-bold text-slate-700 mb-4">My Projects</h2>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full mb-4" />
                <div className="h-8 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-14 h-14 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-base font-semibold mb-1">
              {search || filter !== "All" ? "No projects match your filters" : "No projects yet"}
            </p>
            <p className="text-sm mb-5">
              {search || filter !== "All"
                ? "Try adjusting your search or filter."
                : "Create your first project to get started."}
            </p>
            {!search && filter === "All" && (
              <button
                onClick={() => { setEditing(null); setShowForm(true); }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
              >
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => { setEditing(project); setShowForm(true); }}
                onDelete={() => handleDelete(project.id)}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ProjectForm
          initialData={editingProject}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
