<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import LandingPage from './pages/LandingPage';
import CandidateFlow from './pages/CandidateFlow';
import Dashboard from './pages/Dashboard';
import RecruiterJobPage from './pages/RecruiterJobPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
    return (
        <>
            <SignedIn>{children}</SignedIn>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/start" element={<CandidateFlow />} />
                <Route path="/interview/:jobId" element={<CandidateFlow />} />

                {/* Protected routes - Recruiters only */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/recruiter"
                    element={
                        <ProtectedRoute>
                            <RecruiterJobPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
=======
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
>>>>>>> feature/auth-system
}

export default App;
