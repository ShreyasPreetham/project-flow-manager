import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Redirects to /onboarding if the authenticated user hasn't completed
 * the onboarding flow yet. Wraps all main app routes.
 */
export default function OnboardingGuard({ children }) {
  const { needsOnboarding } = useAuth();
  if (needsOnboarding) return <Navigate to="/onboarding" replace />;
  return children;
}
