import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Only renders the onboarding page if the user actually needs it.
 * If they've already completed onboarding, redirect to the dashboard.
 */
export default function OnboardingRoute({ children }) {
  const { needsOnboarding } = useAuth();
  if (!needsOnboarding) return <Navigate to="/dashboard" replace />;
  return children;
}
