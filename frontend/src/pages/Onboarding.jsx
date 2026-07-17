import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TEAM_SIZES = ["1 – 5", "6 – 15", "16 – 30", "31 – 50", "51+"];

const USE_CASES = [
  { emoji: "📈", label: "Sales & CRM" },
  { emoji: "📋", label: "Project Management" },
  { emoji: "🧾", label: "Billing & Finance" },
  { emoji: "📣", label: "Marketing" },
  { emoji: "🤝", label: "HR & People" },
  { emoji: "💬", label: "Customer Support" },
  { emoji: "📝", label: "Contracts & Docs" },
  { emoji: "🛒", label: "Commerce" },
  { emoji: "🔧", label: "IT & Operations" },
  { emoji: "🎓", label: "Education" },
  { emoji: "🏥", label: "Healthcare" },
  { emoji: "🎨", label: "Design & Creative" },
];

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex justify-center pt-10 pb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                 M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">ProjectFlow</span>
      </div>
    </div>
  );
}

// ─── Step dots (only for org flow) ───────────────────────────────────────────
function StepDots({ current, total = 2 }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div key={n} className="flex items-center">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
            ${current >= n
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
              : "bg-slate-100 text-slate-400 border-2 border-slate-200"}`}>
            {n}
          </div>
          {n < total && (
            <div className={`w-16 h-0.5 transition-all ${current > n ? "bg-blue-600" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 0: Account Type ─────────────────────────────────────────────────────
function StepAccountType({ onSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="flex flex-col flex-1">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">How will you use ProjectFlow?</h1>
        <p className="text-slate-400 text-sm">Choose the option that best describes you</p>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Personal */}
        <button
          onClick={() => onSelect("personal")}
          onMouseEnter={() => setHovered("personal")}
          onMouseLeave={() => setHovered(null)}
          className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2
            transition-all text-left
            ${hovered === "personal"
              ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
              : "border-slate-200 bg-white hover:border-blue-300"}`}
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all
            ${hovered === "personal" ? "bg-blue-600" : "bg-slate-100"}`}>
            <svg className={`w-8 h-8 transition-all ${hovered === "personal" ? "text-white" : "text-slate-500"}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-center">
            <p className={`text-base font-bold mb-1 transition-all
              ${hovered === "personal" ? "text-blue-700" : "text-slate-800"}`}>
              Personal
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              For individual use,<br />personal projects & tasks
            </p>
          </div>
        </button>

        {/* Organization */}
        <button
          onClick={() => onSelect("organization")}
          onMouseEnter={() => setHovered("organization")}
          onMouseLeave={() => setHovered(null)}
          className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2
            transition-all text-left
            ${hovered === "organization"
              ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
              : "border-slate-200 bg-white hover:border-blue-300"}`}
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all
            ${hovered === "organization" ? "bg-blue-600" : "bg-slate-100"}`}>
            <svg className={`w-8 h-8 transition-all ${hovered === "organization" ? "text-white" : "text-slate-500"}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5
                   M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-center">
            <p className={`text-base font-bold mb-1 transition-all
              ${hovered === "organization" ? "text-blue-700" : "text-slate-800"}`}>
              Organization
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              For teams & companies,<br />collaborative workspace
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Personal Step: Name only ─────────────────────────────────────────────────
function StepPersonal({ user, data, onChange, onFinish }) {
  const [errors, setErrors] = useState({});

  const handleFinish = () => {
    const errs = {};
    if (!data.displayName.trim()) errs.displayName = "First name is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onFinish();
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Tell us your name</h1>
        <p className="text-slate-400 text-sm">{user?.email || user?.username}</p>
      </div>

      <div className="space-y-5 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              First name <span className="text-red-500">*</span>
            </label>
            <input
              name="displayName"
              value={data.displayName}
              onChange={onChange}
              placeholder="Your first name"
              autoFocus
              className={`w-full px-4 py-3 border rounded-xl text-slate-800 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm
                ${errors.displayName ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"}`}
            />
            {errors.displayName && <p className="mt-1 text-xs text-red-500">{errors.displayName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
            <input
              name="lastName"
              value={data.lastName}
              onChange={onChange}
              placeholder="(optional)"
              className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-slate-800
                placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-transparent transition text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleFinish}
          className="px-8 py-3 bg-slate-900 hover:bg-slate-700 text-white font-semibold
                     rounded-full transition focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Get Started →
        </button>
      </div>
    </div>
  );
}

// ─── Org Step 1: Profile ──────────────────────────────────────────────────────
function StepProfile({ user, data, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!data.displayName.trim()) errs.displayName = "First name is required.";
    if (!data.orgName.trim())     errs.orgName     = "Organization name is required.";
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onNext();
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">
          Create home for your<br />
          <span className="text-blue-600">Workspace</span>
        </h1>
        <p className="text-slate-400 text-sm">{user?.email || user?.username}</p>
      </div>

      <div className="space-y-5 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label>
            <input
              name="displayName"
              value={data.displayName}
              onChange={onChange}
              placeholder="Your name"
              autoFocus
              className={`w-full px-4 py-3 border rounded-xl text-slate-800 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm
                ${errors.displayName ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"}`}
            />
            {errors.displayName && <p className="mt-1 text-xs text-red-500">{errors.displayName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
            <input
              name="lastName"
              value={data.lastName}
              onChange={onChange}
              placeholder="(optional)"
              className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-slate-800
                placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-transparent transition text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization name</label>
          <input
            name="orgName"
            value={data.orgName}
            onChange={onChange}
            placeholder={`${data.displayName || "Your"}'s Organization`}
            className={`w-full px-4 py-3 border rounded-xl text-slate-800 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm
              ${errors.orgName ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"}`}
          />
          {errors.orgName && <p className="mt-1 text-xs text-red-500">{errors.orgName}</p>}
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-slate-900 hover:bg-slate-700 text-white font-semibold
                     rounded-full transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ─── Org Step 2: Team info ────────────────────────────────────────────────────
function StepTeam({ data, onChange, onBack, onFinish }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch]             = useState("");
  const [errors, setErrors]             = useState({});

  const filtered = USE_CASES.filter((u) =>
    u.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleFinish = () => {
    const errs = {};
    if (!data.teamSize) errs.teamSize = "Please select a team size.";
    if (!data.useCase)  errs.useCase  = "Please select a use case.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onFinish();
  };

  const selectUseCase = (label) => {
    onChange({ target: { name: "useCase", value: label } });
    setDropdownOpen(false);
    setSearch("");
    setErrors((e) => ({ ...e, useCase: undefined }));
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">About your team</h1>
        <p className="text-slate-400 text-sm">Help us set up the right experience for you</p>
      </div>

      <div className="space-y-7 flex-1">
        {/* Team size */}
        <div>
          <p className="text-sm font-semibold text-slate-800 mb-3">How big is your team?</p>
          <div className="flex flex-wrap gap-2">
            {TEAM_SIZES.map((size) => (
              <button key={size} type="button"
                onClick={() => {
                  onChange({ target: { name: "teamSize", value: size } });
                  setErrors((e) => ({ ...e, teamSize: undefined }));
                }}
                className={`px-5 py-2.5 rounded-full border text-sm font-medium transition
                  ${data.teamSize === size
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                    : "border-slate-300 text-slate-700 hover:border-blue-400 hover:text-blue-600 bg-white"}`}>
                {size}
              </button>
            ))}
          </div>
          {errors.teamSize && <p className="mt-2 text-xs text-red-500">{errors.teamSize}</p>}
        </div>

        {/* Use case dropdown */}
        <div>
          <p className="text-sm font-semibold text-slate-800 mb-3">
            What will you primarily use it for?
          </p>
          <div className="relative">
            <button type="button" onClick={() => setDropdownOpen((o) => !o)}
              className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl
                text-sm transition bg-white
                ${dropdownOpen
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : errors.useCase ? "border-red-400" : "border-slate-200 hover:border-slate-300"}`}>
              <span className={data.useCase ? "text-slate-800 font-medium" : "text-slate-400"}>
                {data.useCase || "Select a use case"}
              </span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200
                              rounded-2xl shadow-xl overflow-hidden">
                <div className="p-3 border-b border-slate-100">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
                    </svg>
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus />
                  </div>
                </div>
                <ul className="max-h-52 overflow-y-auto py-1">
                  {filtered.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-slate-400 text-center">No results</li>
                  ) : (
                    filtered.map((u) => (
                      <li key={u.label}>
                        <button type="button" onClick={() => selectUseCase(u.label)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left
                            hover:bg-blue-50 transition
                            ${data.useCase === u.label ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700"}`}>
                          <span className="text-lg">{u.emoji}</span>
                          {u.label}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
          {errors.useCase && <p className="mt-2 text-xs text-red-500">{errors.useCase}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button type="button" onClick={handleFinish}
          className="px-8 py-3 bg-slate-900 hover:bg-slate-700 text-white font-semibold
                     rounded-full transition">
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Main Onboarding ──────────────────────────────────────────────────────────
export default function Onboarding() {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  // step: "type" | "personal" | "org-1" | "org-2"
  const [step, setStep] = useState("type");
  const [accountType, setAccountType] = useState(null); // "personal" | "organization"

  const [data, setData] = useState({
    displayName: user?.username || "",
    lastName:    "",
    orgName:     "",
    teamSize:    "",
    useCase:     "",
  });

  const handleChange = (e) =>
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSelectType = (type) => {
    setAccountType(type);
    setStep(type === "personal" ? "personal" : "org-1");
  };

  const handleFinish = (extra = {}) => {
    completeOnboarding({ accountType, ...data, ...extra });
    navigate("/dashboard");
  };

  // Determine step dot position for org flow
  const orgStepNumber = step === "org-1" ? 1 : step === "org-2" ? 2 : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Logo />

      <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-16">
        <div className="w-full max-w-md flex flex-col">

          {/* Step dots — only for org flow */}
          {orgStepNumber && <StepDots current={orgStepNumber} />}

          {/* ── Step 0: Account type ── */}
          {step === "type" && (
            <StepAccountType onSelect={handleSelectType} />
          )}

          {/* ── Personal: name only ── */}
          {step === "personal" && (
            <StepPersonal
              user={user}
              data={data}
              onChange={handleChange}
              onFinish={handleFinish}
            />
          )}

          {/* ── Org Step 1: Profile ── */}
          {step === "org-1" && (
            <StepProfile
              user={user}
              data={data}
              onChange={handleChange}
              onNext={() => setStep("org-2")}
            />
          )}

          {/* ── Org Step 2: Team info ── */}
          {step === "org-2" && (
            <StepTeam
              data={data}
              onChange={handleChange}
              onBack={() => setStep("org-1")}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-6 text-xs text-slate-400 space-x-4">
        <span className="cursor-pointer hover:text-slate-600 transition">Terms & Conditions</span>
        <span className="cursor-pointer hover:text-slate-600 transition">Privacy Policy</span>
      </div>
    </div>
  );
}
