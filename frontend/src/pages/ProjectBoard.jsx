import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const STAGES = ["To Do", "In Progress", "Done"];

const STAGE_STYLES = {
  "To Do":       { header: "bg-slate-100 text-slate-700",  dot: "bg-slate-400",  border: "border-slate-200"  },
  "In Progress": { header: "bg-amber-50 text-amber-700",   dot: "bg-amber-400",  border: "border-amber-200"  },
  "Done":        { header: "bg-green-50 text-green-700",   dot: "bg-green-400",  border: "border-green-200"  },
};

const PRIORITY_FILTERS = ["All", "Critical", "High", "Medium", "Low"];

const TYPE_BADGE = {
  Software: "bg-violet-100 text-violet-700",
  Business: "bg-blue-100 text-blue-700",
  Personal: "bg-emerald-100 text-emerald-700",
};

export default function ProjectBoard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject]         = useState(null);
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [priorityFilter, setPriority] = useState("All");
  const [isGuest, setIsGuest]         = useState(false); // assigned user, not owner

  // ── Fetch project + tasks ─────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      // Try owner endpoint first
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}/`),
        api.get(`/projects/${projectId}/tasks/`),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setIsGuest(false);
    } catch (ownerErr) {
      if (ownerErr.response?.status === 404) {
        // Not owner — try guest endpoint (assigned user)
        try {
          const [projRes, tasksRes] = await Promise.all([
            api.get(`/guest/projects/${projectId}/`),
            api.get(`/guest/projects/${projectId}/tasks/`),
          ]);
          setProject(projRes.data);
          setTasks(tasksRes.data);
          setIsGuest(true);
        } catch {
          navigate("/dashboard");
        }
      } else {
        setError("Failed to load board. Please refresh.");
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleCreate = async (data) => {
    const res = await api.post(`/projects/${projectId}/tasks/`, data);
    setTasks((t) => [res.data, ...t]);
  };

  const handleUpdate = async (id, data) => {
    let res;
    if (isGuest) {
      // Guest can only update stage of their own task
      res = await api.put(`/guest/projects/${projectId}/tasks/${id}/`, { stage: data.stage });
    } else {
      res = await api.put(`/projects/${projectId}/tasks/${id}/`, data);
    }
    setTasks((t) => t.map((task) => (task.id === id ? res.data : task)));
    if (!isGuest) {
      const projRes = await api.get(`/projects/${projectId}/`);
      setProject(projRes.data);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/projects/${projectId}/tasks/${id}/`);
    setTasks((t) => t.filter((task) => task.id !== id));
    const projRes = await api.get(`/projects/${projectId}/`);
    setProject(projRes.data);
  };

  const handleFormSubmit = async (data) => {
    if (editingTask?.id) await handleUpdate(editingTask.id, data);
    else await handleCreate(data);
    setShowForm(false); setEditingTask(null);
  };

  // ── Filtered + grouped tasks ──────────────────────────────────────────────
  const filtered = priorityFilter === "All"
    ? tasks
    : tasks.filter((t) => t.priority === priorityFilter);

  const tasksByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = filtered.filter((t) => t.stage === stage);
    return acc;
  }, {});

  const progress = project?.task_count > 0
    ? Math.round((project.done_count / project.task_count) * 100)
    : 0;

  const overdueTasks = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.stage !== "Done"
  ).length;

  // ── My assigned tasks in this project (highlight for guest) ───────────────
  const myEmail = (user?.email || "").toLowerCase();
  const myTaskIds = new Set(
    tasks
      .filter((t) => (t.assignee || "").toLowerCase() === myEmail)
      .map((t) => t.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64" />
            <div className="grid grid-cols-3 gap-6">
              {[1,2,3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="h-5 bg-slate-200 rounded w-24 mb-4" />
                  {[1,2].map((j) => <div key={j} className="h-24 bg-slate-100 rounded-lg mb-3" />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/dashboard" className="hover:text-blue-600 transition">Projects</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-800 font-medium">{project?.name}</span>
          {isGuest && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              Assigned View
            </span>
          )}
        </nav>

        {/* Guest banner */}
        {isGuest && (
          <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200
                          rounded-xl text-blue-700 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              You have been assigned tasks in this project.
              <strong className="ml-1">Your tasks are highlighted.</strong>
              You can update the stage of your assigned tasks.
            </span>
          </div>
        )}

        {/* Project header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-slate-800">{project?.name}</h1>
                {project?.project_type && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                    ${TYPE_BADGE[project.project_type] || "bg-slate-100 text-slate-600"}`}>
                    {project.project_type}
                  </span>
                )}
              </div>
              {project?.description && (
                <p className="text-slate-500 text-sm mb-4">{project.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  {project?.todo_count} To Do
                </span>
                <span className="flex items-center gap-1.5 text-amber-600">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  {project?.in_progress_count} In Progress
                </span>
                <span className="flex items-center gap-1.5 text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  {project?.done_count} Done
                </span>
                {overdueTasks > 0 && (
                  <span className="flex items-center gap-1.5 text-red-600">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {overdueTasks} Overdue
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">Overall Progress</p>
                <p className="text-2xl font-bold text-slate-800">{progress}%</p>
              </div>
              <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-slate-400">{project?.task_count} total tasks</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Priority:</span>
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
          {/* Only owner can create new tasks */}
          {!isGuest && (
            <button
              onClick={() => { setEditingTask(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                         text-white text-sm font-semibold rounded-lg transition shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Kanban board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STAGES.map((stage) => {
            const style = STAGE_STYLES[stage];
            const stageTasks = tasksByStage[stage];
            return (
              <div key={stage}
                className={`bg-white rounded-xl border ${style.border} flex flex-col min-h-[400px]`}>

                {/* Column header */}
                <div className={`flex items-center gap-2 px-4 py-3 rounded-t-xl ${style.header}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                  <h2 className="font-semibold text-sm">{stage}</h2>
                  <span className="ml-auto text-xs font-medium opacity-70">{stageTasks.length}</span>
                </div>

                {/* Task list */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[600px]">
                  {stageTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                      <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-xs">
                        {priorityFilter !== "All" ? `No ${priorityFilter} tasks` : "No tasks here"}
                      </p>
                    </div>
                  ) : (
                    stageTasks.map((task) => {
                      const isMyTask = myTaskIds.has(task.id);
                      return (
                        <div key={task.id}
                          className={isMyTask && isGuest
                            ? "ring-2 ring-blue-400 ring-offset-1 rounded-xl"
                            : ""}>
                          {/* "Your task" badge for guest */}
                          {isMyTask && isGuest && (
                            <div className="px-3 pt-2 pb-0">
                              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">
                                Your task
                              </span>
                            </div>
                          )}
                          <TaskCard
                            task={task}
                            onEdit={
                              // Guest can only edit their own tasks (stage only)
                              isGuest
                                ? isMyTask
                                  ? () => { setEditingTask(task); setShowForm(true); }
                                  : null
                                : () => { setEditingTask(task); setShowForm(true); }
                            }
                            onDelete={
                              isGuest ? null : () => handleDelete(task.id)
                            }
                            readOnly={isGuest && !isMyTask}
                          />
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick-add — owner only */}
                {!isGuest && (
                  <div className="p-3 border-t border-slate-100">
                    <button
                      onClick={() => { setEditingTask({ stage: stage }); setShowForm(true); }}
                      className="w-full text-xs text-slate-400 hover:text-blue-600 hover:bg-blue-50
                                 py-2 rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add task
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {showForm && (
        <TaskForm
          initialData={editingTask}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
          guestMode={isGuest} // only show stage selector for guests
        />
      )}
    </div>
  );
}
