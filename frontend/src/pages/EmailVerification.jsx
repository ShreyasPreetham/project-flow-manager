import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../services/api";

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(Boolean(token));
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let active = true;
    const confirmToken = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.post("/email-verification/confirm/", { token });
        const verifiedEmail = res.data.email;
        localStorage.setItem("verified_signup_email", verifiedEmail);
        localStorage.setItem("verified_signup_token", res.data.verification_token);
        if (active) {
          navigate(`/register?email=${encodeURIComponent(verifiedEmail)}`, { replace: true });
        }
      } catch (err) {
        if (!active) return;
        const detail = err.response?.data?.detail;
        setError(detail || "Verification link is invalid or expired.");
        setLoading(false);
      }
    };

    confirmToken();
    return () => {
      active = false;
    };
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setMessage("");
    setError("");
    try {
      await api.post("/email-verification/request/", { email });
      setMessage("Check your inbox and click the Verify Email button to continue.");
    } catch (err) {
      const data = err.response?.data;
      const detail = data?.email?.[0] || data?.detail || "Unable to send verification email.";
      setError(detail);
    } finally {
      setSending(false);
    }
  };

  if (token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          {loading ? (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
              <h1 className="text-2xl font-bold text-slate-800">Verifying email</h1>
              <p className="mt-2 text-sm text-slate-500">Please wait while we confirm your address.</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-800">Verification failed</h1>
              <p className="mt-2 text-sm text-red-600">{error}</p>
              <Link
                to="/verify-email"
                className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-white font-semibold hover:bg-blue-700"
              >
                Try again
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8m-9 13a9 9 0 100-18 9 9 0 000 18z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Verify your email</h1>
          <p className="text-slate-500 text-sm mt-1">We’ll send a verification link before you register.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="verify-email">
              Email address
            </label>
            <input
              id="verify-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              placeholder="you@gmail.com"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {message && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {sending ? "Sending..." : "Verify Email"}
          </button>
        </form>
      </div>
    </div>
  );
}
