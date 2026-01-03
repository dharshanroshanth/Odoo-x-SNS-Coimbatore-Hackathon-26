import React from 'react';
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from 'sonner';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import CreateTrip from '@/pages/CreateTrip';
import MyTrips from '@/pages/MyTrips';
import TripDetail from '@/pages/TripDetail';
import Profile from '@/pages/Profile';
import Community from '@/pages/Community';
import PublicTrip from '@/pages/PublicTrip';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/public/:publicUrl" element={<PublicTrip />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/create-trip" element={
              <ProtectedRoute>
                <CreateTrip />
              </ProtectedRoute>
            } />
            <Route path="/my-trips" element={
              <ProtectedRoute>
                <MyTrips />
              </ProtectedRoute>
            } />
            <Route path="/trips/:tripId" element={
              <ProtectedRoute>
                <TripDetail />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/community" element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
