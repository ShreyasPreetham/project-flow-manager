import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

/**
 * Reads the saved onboarding profile for a user and returns their display name.
 * Falls back to username if no profile saved.
 */
function getDisplayName(userId, fallback) {
  try {
    const raw = localStorage.getItem(`onboarding_profile_${userId}`);
    if (!raw) return fallback;
    const profile = JSON.parse(raw);
    const first = (profile.displayName || "").trim();
    const last  = (profile.lastName   || "").trim();
    if (first) return last ? `${first} ${last}` : first;
  } catch {}
  return fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser]                       = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [displayName, setDisplayName]         = useState("");

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      api.get("/me/")
        .then((res) => {
          const u = res.data;
          setUser(u);
          const done = localStorage.getItem(`onboarding_done_${u.id}`);
          setNeedsOnboarding(!done);
          setDisplayName(getDisplayName(u.id, u.username));
        })
        .catch(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const res = await api.post("/login/", credentials);
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    const meRes = await api.get("/me/");
    const u = meRes.data;
    setUser(u);
    const done = localStorage.getItem(`onboarding_done_${u.id}`);
    setNeedsOnboarding(!done);
    setDisplayName(getDisplayName(u.id, u.username));
    return u;
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (data) => {
    const res = await api.post("/register/", data);
    const { access, refresh, user: newUser } = res.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setUser(newUser);
    setNeedsOnboarding(true);
    setDisplayName(newUser.username); // will be updated after onboarding
    return newUser;
  }, []);

  // ── Complete onboarding ───────────────────────────────────────────────────
  const completeOnboarding = useCallback((profileData) => {
    if (!user) return;
    localStorage.setItem(`onboarding_done_${user.id}`, "true");
    localStorage.setItem(`onboarding_profile_${user.id}`, JSON.stringify(profileData));
    setNeedsOnboarding(false);
    // Update display name immediately after onboarding
    const first = (profileData.displayName || "").trim();
    const last  = (profileData.lastName    || "").trim();
    if (first) setDisplayName(last ? `${first} ${last}` : first);
  }, [user]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setNeedsOnboarding(false);
    setDisplayName("");
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, needsOnboarding, displayName,
      login, register, completeOnboarding, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
