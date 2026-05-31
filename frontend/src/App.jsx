import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import ProjectBoard from "./pages/ProjectBoard";
import ProtectedRoute from "./routes/ProtectedRoute";
import OnboardingRoute from "./routes/OnboardingRoute";
import OnboardingGuard from "./routes/OnboardingGuard";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Onboarding — only for logged-in users who haven't completed it */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingRoute>
              <Onboarding />
            </OnboardingRoute>
          </ProtectedRoute>
        }
      />

      {/* Protected app routes — bounce to /onboarding if not done */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <Home />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProjectBoard />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />

      {/* Default */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
