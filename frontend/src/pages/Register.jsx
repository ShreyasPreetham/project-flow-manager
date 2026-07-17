import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Field component defined OUTSIDE Register so it is never re-created ──────
function Field({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  value,
  onChange,
  error,
  readOnly = false,
  helperText = "",
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border rounded-lg text-slate-800 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                    ${readOnly ? "bg-slate-100 cursor-not-allowed" : ""}
                    ${error ? "border-red-400 bg-red-50" : "border-slate-300"}`}
      />
      {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function PasswordField({
  name,
  label,
  placeholder,
  autoComplete,
  value,
  onChange,
  error,
  showPassword,
  onToggle,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`no-browser-password-ui w-full px-4 py-2.5 pr-12 border rounded-lg text-slate-800 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                    ${error ? "border-red-400 bg-red-50" : "border-slate-300"}`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-3 my-auto inline-flex h-9 w-9 items-center justify-center rounded-md
                     text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          {showPassword ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.88 4.24A10.94 10.94 0 0112 4c7 0 10 8 10 8a19.7 19.7 0 01-3.17 4.52" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.11 6.11C3.64 8.04 2 12 2 12s3 8 10 8a10.94 10.94 0 005.19-1.34" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
              <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  const isPlainObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

  useEffect(() => {
    const queryEmail = (searchParams.get("email") || "").toLowerCase();
    const storedEmail = (localStorage.getItem("verified_signup_email") || "").toLowerCase();
    const storedToken = localStorage.getItem("verified_signup_token") || "";
    const nextEmail = queryEmail || storedEmail;
    const nextToken = storedToken || searchParams.get("token") || "";

    if (!nextEmail || !nextToken) {
      navigate("/verify-email", { replace: true });
      return;
    }

    setVerifiedEmail(nextEmail);
    setVerificationToken(nextToken);
    setForm((prev) => ({ ...prev, email: nextEmail }));
  }, [navigate, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const normalized = name === "email" ? value.toLowerCase() : value;
    setForm((prev) => ({ ...prev, [name]: normalized }));
    // Clear field-level error on change
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /** Client-side validation before hitting the API */
  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Name is required.";
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else {
      const email = form.email.trim().toLowerCase();
      if ((email.match(/@/g) || []).length !== 1) {
        errs.email = "Enter a valid email.";
      } else {
        const [local, domain] = email.split("@");
        const localRe = /^[a-z0-9._%+-]+$/;
        const valid = localRe.test(local) && domain === "gmail.com";

        if (!valid) {
          errs.email = "Email must end with @gmail.com.";
        }
      }
      if (errs.email) {
        errs.email = errs.email || "Enter a valid email.";
      }
    }
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.password !== form.password2) errs.password2 = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      await register({ ...form, email_verification_token: verificationToken });
      localStorage.removeItem("verified_signup_email");
      localStorage.removeItem("verified_signup_token");
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      // Map Django field errors back to the form when the backend returns JSON.
      if (isPlainObject(data)) {
      const mapped = {};
      Object.entries(data).forEach(([key, val]) => {
        mapped[key] = Array.isArray(val) ? val.join(" ") : val;
      });
      setErrors(mapped);
      } else {
        setErrors({
          non_field_errors:
            "Unable to reach the backend or the server returned an unexpected error. Please check the deploy logs.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create account</h1>
          <p className="text-slate-500 text-sm mt-1">Start managing your tasks today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field
            name="username"
            label="Name"
            placeholder="Your name"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
          />
          <Field
            name="email"
            label="Email"
            type="email"
            placeholder="Verified email"
            autoComplete="off"
            value={form.email}
            onChange={handleChange}
            readOnly
            helperText="This email was verified and cannot be changed."
            error={errors.email}
          />
          <PasswordField
            name="password"
            label="Password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            showPassword={showPassword}
            onToggle={() => setShowPassword((prev) => !prev)}
          />
          <PasswordField
            name="password2"
            label="Confirm Password"
            placeholder="Repeat password"
            autoComplete="new-password"
            value={form.password2}
            onChange={handleChange}
            error={errors.password2}
            showPassword={showPassword2}
            onToggle={() => setShowPassword2((prev) => !prev)}
          />
          <input type="hidden" name="email_verification_token" value={verificationToken} readOnly />

          {/* Non-field errors */}
          {errors.non_field_errors && (
            <p className="text-sm text-red-600">{errors.non_field_errors}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold
                       rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account…
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
