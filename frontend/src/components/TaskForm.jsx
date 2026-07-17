import { useState, useEffect, useRef } from "react";

const STAGES     = ["To Do", "In Progress", "Done"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const PRIORITY_STYLES = {
  Low:      "border-slate-200 text-slate-600 hover:border-slate-400",
  Medium:   "border-slate-200 text-slate-600 hover:border-blue-300",
  High:     "border-slate-200 text-slate-600 hover:border-orange-300",
  Critical: "border-slate-200 text-slate-600 hover:border-red-300",
};

const PRIORITY_ACTIVE = {
  Low:      "bg-slate-600 border-slate-600 text-white",
  Medium:   "bg-blue-600 border-blue-600 text-white",
  High:     "bg-orange-500 border-orange-500 text-white",
  Critical: "bg-red-600 border-red-600 text-white",
};

/**
 * TaskForm — modal for creating or editing a task.
 * guestMode=true  → only shows the stage picker (assigned user updating their stage)
 * guestMode=false → full form (owner)
 */
export default function TaskForm({ initialData, onSubmit, onClose, guestMode = false }) {
  const isEditing = !!(initialData?.id);

  const [form, setForm] = useState({
    title:       initialData?.title       || "",
    description: initialData?.description || "",
    assignee:    initialData?.assignee    || "",
    stage:       initialData?.stage       || "To Do",
    priority:    initialData?.priority    || "Medium",
    due_date:    initialData?.due_date    || "",
  });
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState("");

  const titleRef = useRef(null);
  const formRef  = useRef(null);

  useEffect(() => {
    if (!guestMode) titleRef.current?.focus();
  }, [guestMode]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (guestMode) {
      if (!STAGES.includes(form.stage)) errs.stage = "Select a valid stage.";
      return errs;
    }
    if (!form.title.trim())             errs.title    = "Title is required.";
    else if (form.title.trim().length > 255) errs.title = "Max 255 characters.";
    if (!form.assignee.trim())          errs.assignee = "Assignee is required.";
    if (!form.due_date)                 errs.due_date = "Due date is required.";
    if (!STAGES.includes(form.stage))   errs.stage    = "Select a valid stage.";
    if (!PRIORITIES.includes(form.priority)) errs.priority = "Select a valid priority.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      if (guestMode) {
        await onSubmit({ stage: form.stage });
      } else {
        await onSubmit({
          title:       form.title.trim(),
          description: form.description.trim(),
          assignee:    form.assignee.trim(),
          stage:       form.stage,
          priority:    form.priority,
          due_date:    form.due_date || null,
        });
      }
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const mapped = {};
        Object.entries(data).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v.join(" ") : String(v);
        });
        setErrors(mapped);
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">
            {guestMode ? "Update Task Stage" : isEditing ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form ref={formRef} onSubmit={handleSubmit}
          className="px-6 py-5 space-y-5 overflow-y-auto" noValidate>

          {apiError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {apiError}
            </div>
          )}

          {/* ── GUEST MODE: only stage picker ── */}
          {guestMode ? (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                You can update the stage of your assigned task:
                <strong className="block text-slate-800 mt-1">{initialData?.title}</strong>
              </p>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stage <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STAGES.map((s) => (
                  <label key={s}
                    className={`flex items-center justify-center px-3 py-3 rounded-lg border
                      text-sm font-medium cursor-pointer transition
                      ${form.stage === s
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"}`}>
                    <input type="radio" name="stage" value={s}
                      checked={form.stage === s} onChange={handleChange} className="sr-only" />
                    {s}
                  </label>
                ))}
              </div>
              {errors.stage && <p className="mt-1 text-xs text-red-600">{errors.stage}</p>}
            </div>
          ) : (
            /* ── OWNER MODE: full form ── */
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  ref={titleRef}
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="What needs to be done?"
                  maxLength={255}
                  className={`w-full px-4 py-2.5 border rounded-lg text-slate-800 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                    ${errors.title ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Add more details… (optional)"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-800
                    placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent transition resize-none"
                />
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Assignee <span className="text-red-500">*</span>
                </label>
                <input
                  name="assignee"
                  value={form.assignee}
                  onChange={handleChange}
                  placeholder="Enter email to notify assignee"
                  maxLength={120}
                  className={`w-full px-4 py-2.5 border rounded-lg text-slate-800 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                    ${errors.assignee ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                />
                {form.assignee && form.assignee.includes("@") && (
                  <p className="mt-1 text-xs text-blue-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    A task notification email will be sent to this address
                  </p>
                )}
                {errors.assignee && <p className="mt-1 text-xs text-red-600">{errors.assignee}</p>}
              </div>

              {/* Stage */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stage <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STAGES.map((s) => (
                    <label key={s}
                      className={`flex items-center justify-center px-3 py-2 rounded-lg border
                        text-sm font-medium cursor-pointer transition
                        ${form.stage === s
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"}`}>
                      <input type="radio" name="stage" value={s}
                        checked={form.stage === s} onChange={handleChange} className="sr-only" />
                      {s}
                    </label>
                  ))}
                </div>
                {errors.stage && <p className="mt-1 text-xs text-red-600">{errors.stage}</p>}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRIORITIES.map((p) => (
                    <label key={p}
                      className={`flex items-center justify-center px-2 py-2 rounded-lg border
                        text-xs font-semibold cursor-pointer transition
                        ${form.priority === p ? PRIORITY_ACTIVE[p] : PRIORITY_STYLES[p]}`}>
                      <input type="radio" name="priority" value={p}
                        checked={form.priority === p} onChange={handleChange} className="sr-only" />
                      {p}
                    </label>
                  ))}
                </div>
                {errors.priority && <p className="mt-1 text-xs text-red-600">{errors.priority}</p>}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-800
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                {errors.due_date && <p className="mt-1 text-xs text-red-600">{errors.due_date}</p>}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm
                         font-semibold rounded-lg hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                         text-white text-sm font-semibold rounded-lg transition">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </span>
              ) : guestMode ? "Update Stage" : isEditing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
