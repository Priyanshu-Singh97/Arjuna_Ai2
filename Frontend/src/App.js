// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthProvider";
import Login from "./Login";
import Register from "./Register";
import Welcome from "./Welcome";
import ProtectedRoute from "./ProtectedRoute";
import LandingPage from "./LandingPage";
import VerifyNotice from "./VerifyNotice";
import VerifyEmail from "./VerifyEmail";
import VerifyLanding from "./VerifyLanding";
import InterviewAvatar from "./Interview";
import AvatarTester from './AvatarTester';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

function AppRoutes() {
  const { token } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={token ? <Navigate to="/welcome" replace /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/welcome" replace /> : <Register />} />
      <Route path="/verify-notice" element={<VerifyNotice />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-landing" element={<VerifyLanding />} />
      <Route path="/avatar-test" element={<AvatarTester />} />
      
      {/* Welcome page - accessible to both guests and authenticated users */}
      <Route 
        path="/welcome" 
        element={
          <ProtectedRoute requireAuth={false}>
            <Welcome />
          </ProtectedRoute>
        } 
      />
      
      {/* Interview page - accessible to both guests and authenticated users */}
      <Route 
        path="/interview" 
        element={
          <ProtectedRoute requireAuth={false}>
            <InterviewAvatar />
          </ProtectedRoute>
        } 
      />
      
      {/* Only protect routes that truly need authentication */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute requireAuth={true}>
            <ProfilePage /> {/* You might need to create this */}
          </ProtectedRoute>
        } 
      />
      
      {/* 404 page */}
      <Route path="*" element={<h2 style={{ margin: 20 }}>404: Page Not Found</h2>} />
    </Routes>
  );
}

// Placeholder for ProfilePage if you don't have it yet
function ProfilePage() {
  return (
    <div style={{ margin: 20 }}>
      <h2>User Profile</h2>
      <p>This page requires authentication.</p>
    </div>
  );
}