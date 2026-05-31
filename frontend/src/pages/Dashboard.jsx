import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import api from "../services/api";

const STAGES = ["To Do", "In Progress", "Done"];

/** Column accent colours */
const STAGE_STYLES = {
  "To Do": {
    header: "bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
    border: "border-slate-200",
  },
  "In Progress": {
    header: "bg-amber-50 text-amber-700",
    dot: "bg-amber-400",
    border: "border-amber-200",
  },
  "Done": {
    header: "bg-green-50 text-green-700",
    dot: "bg-green-400",
    border: "border-green-200",
  },
};

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // null = create mode

  // ── Fetch all tasks ──────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/tasks/");
      setTasks(res.data);
    } catch {
      setError("Failed to load tasks. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── CRUD handlers ────────────────────────────────────────────────────────
  const handleCreate = async (data) => {
    const res = await api.post("/tasks/", data);
    setTasks((prev) => [res.data, ...prev]);
  };

  const handleUpdate = async (id, data) => {
    const res = await api.put(`/tasks/${id}/`, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
  };

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}/`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // ── Modal helpers ────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleFormSubmit = async (data) => {
    if (editingTask) {
      await handleUpdate(editingTask.id, data);
    } else {
      await handleCreate(data);
    }
    closeForm();
  };

  // ── Group tasks by stage ─────────────────────────────────────────────────
  const tasksByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = tasks.filter((t) => t.stage === stage);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Tasks</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                       text-white text-sm font-semibold rounded-lg transition
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STAGES.map((stage) => (
              <div key={stage} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-24 mb-4" />
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-slate-100 rounded-lg mb-3" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          /* Kanban board */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STAGES.map((stage) => {
              const style = STAGE_STYLES[stage];
              const stageTasks = tasksByStage[stage];
              return (
                <div
                  key={stage}
                  className={`bg-white rounded-xl border ${style.border} flex flex-col min-h-[400px]`}
                >
                  {/* Column header */}
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-t-xl ${style.header}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                    <h2 className="font-semibold text-sm">{stage}</h2>
                    <span className="ml-auto text-xs font-medium opacity-70">
                      {stageTasks.length}
                    </span>
                  </div>

                  {/* Task list */}
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                    {stageTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                        <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-xs">No tasks here</p>
                      </div>
                    ) : (
                      stageTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={() => openEdit(task)}
                          onDelete={() => handleDelete(task.id)}
                        />
                      ))
                    )}
                  </div>

                  {/* Quick-add button per column */}
                  <div className="p-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEditingTask({ stage }); // pre-select stage
                        setShowForm(true);
                      }}
                      className="w-full text-xs text-slate-400 hover:text-blue-600 hover:bg-blue-50
                                 py-2 rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Task create / edit modal */}
      {showForm && (
        <TaskForm
          initialData={editingTask}
          onSubmit={handleFormSubmit}
          onClose={closeForm}
        />
      )}
    </div>
  );
}
