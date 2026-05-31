import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import ProjectForm from "../components/ProjectForm";
import api from "../services/api";

const TYPE_FILTERS = ["All", "Software", "Business", "Personal"];

const STATS_CONFIG = [
  { label: "Total Projects", key: "projects",    color: "text-blue-600",   bg: "bg-blue-50"   },
  { label: "Total Tasks",    key: "tasks",        color: "text-slate-700",  bg: "bg-slate-50"  },
  { label: "In Progress",    key: "inProgress",   color: "text-amber-600",  bg: "bg-amber-50"  },
  { label: "Completed",      key: "done",         color: "text-green-600",  bg: "bg-green-50"  },
];

export default function Home() {
  const { user } = useAuth();
  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [editingProject, setEditing] = useState(null);
  const [filter, setFilter]         = useState("All");
  const [search, setSearch]         = useState("");

  const fetchProjects = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/projects/");
      setProjects(res.data);
    } catch {
      setError("Failed to load projects. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ── CRUD ──────────────────────────────────────────────────────────────────
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

  // ── Filtered list ─────────────────────────────────────────────────────────
  const visible = projects.filter((p) => {
    const matchType   = filter === "All" || p.project_type === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome banner */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {user?.username} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's an overview of all your projects.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {STATS_CONFIG.map(({ label, key, color, bg }) => (
            <div key={key} className={`${bg} rounded-2xl p-4`}>
              <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{stats[key]}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
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

            {/* Type filter pills */}
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

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map((i) => (
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
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-lg font-semibold mb-1">
              {search || filter !== "All" ? "No projects match your filters" : "No projects yet"}
            </p>
            <p className="text-sm mb-6">
              {search || filter !== "All" ? "Try adjusting your search or filter." : "Create your first project to get started."}
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
