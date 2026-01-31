import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import QuestionBank from "./pages/QuestionBank";
import TakeQuiz from "./pages/TakeQuiz";
import Results from "./pages/Results";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { TestProvider } from "./contexts/TestContext"; // ✅ import TestProvider

function RoleRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role !== role) return <div style={{ padding: 16 }}>Not allowed.</div>;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <TestProvider> {/* ✅ wrap entire app in TestProvider */}
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/question-bank"
              element={
                <ProtectedRoute>
                  <RoleRoute role="examiner">
                    <QuestionBank />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/take-quiz"
              element={
                <ProtectedRoute>
                  <RoleRoute role="testtaker">
                    <TakeQuiz />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <RoleRoute role="testtaker">
                    <Results />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TestProvider>
    </AuthProvider>
  );
}
