import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

/**
 * AuthProvider exposes:
 *  - user               : current user object (or null)
 *  - loading            : true while verifying stored token on mount
 *  - needsOnboarding    : true if this user hasn't completed onboarding yet
 *  - login()            : { username, password } → stores tokens, sets user
 *  - register()         : registration data → stores tokens, sets user, marks needsOnboarding=true
 *  - completeOnboarding(): saves onboarding data to localStorage, clears flag
 *  - logout()           : clears everything
 */
export function AuthProvider({ children }) {
  const [user, setUser]                     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // ── Restore session on mount ───────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      api
        .get("/me/")
        .then((res) => {
          setUser(res.data);
          // Check if this user has completed onboarding
          const done = localStorage.getItem(`onboarding_done_${res.data.id}`);
          setNeedsOnboarding(!done);
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

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const res = await api.post("/login/", credentials);
    const { access, refresh } = res.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    const meRes = await api.get("/me/");
    const loggedInUser = meRes.data;
    setUser(loggedInUser);
    // Check onboarding status for this specific user
    const done = localStorage.getItem(`onboarding_done_${loggedInUser.id}`);
    setNeedsOnboarding(!done);
    return loggedInUser;
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (data) => {
    const res = await api.post("/register/", data);
    const { access, refresh, user: newUser } = res.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setUser(newUser);
    // Brand new user always needs onboarding
    setNeedsOnboarding(true);
    return newUser;
  }, []);

  // ── Complete onboarding ────────────────────────────────────────────────────
  const completeOnboarding = useCallback((profileData) => {
    if (!user) return;
    // Persist profile data and mark as done — keyed by user ID so it's per-account
    localStorage.setItem(`onboarding_done_${user.id}`, "true");
    localStorage.setItem(`onboarding_profile_${user.id}`, JSON.stringify(profileData));
    setNeedsOnboarding(false);
  }, [user]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setNeedsOnboarding(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, needsOnboarding,
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
