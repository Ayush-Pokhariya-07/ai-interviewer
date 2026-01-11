import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import CandidateFlow from "./pages/CandidateFlow";
import Dashboard from "./pages/Dashboard";
import RecruiterJobPage from "./pages/RecruiterJobPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthStore from "./store/useAuthStore";

function App() {
  const { checkAuthUser } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app load
    checkAuthUser();
  }, [checkAuthUser]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/start" replace />} />
        <Route path="/start" element={<CandidateFlow />} />
        <Route path="/interview/:jobId" element={<CandidateFlow />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute>
              <RecruiterJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
