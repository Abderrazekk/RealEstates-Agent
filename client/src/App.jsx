import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

import Home from './pages/Home/Home';
import Properties from './pages/Properties/Properties';
import PropertyDetails from './pages/PropertyDetails/PropertyDetails';
import About from './pages/About/About';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/User/Profile';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProperties from './pages/Admin/Properties';
import PropertyForm from './components/Admin/PropertyForm';
import SavedProperties from './pages/User/SavedProperties';
import AdminMeetings from './components/Admin/AdminMeetings';
import MyMeetings from './components/MyMeetings/MyMeetings'; // ADD THIS LINE

// NO MORE: import './App.css';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && !isAdmin()) return <Navigate to="/" />;

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User */}
          <Route 
            path="/profile" 
            element={<ProtectedRoute><Profile /></ProtectedRoute>} 
          />
          <Route 
            path="/saved" 
            element={<ProtectedRoute><SavedProperties /></ProtectedRoute>} 
          />
          {/* Add this new route */}
          <Route 
            path="/my-meetings" 
            element={<ProtectedRoute><MyMeetings /></ProtectedRoute>} 
          />

          {/* Admin */}
          <Route 
            path="/admin/dashboard" 
            element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/properties" 
            element={<ProtectedRoute requireAdmin><AdminProperties /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/properties/create" 
            element={<ProtectedRoute requireAdmin><PropertyForm /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/properties/edit/:id" 
            element={<ProtectedRoute requireAdmin><PropertyForm /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/meetings" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminMeetings />
              </ProtectedRoute>
            } 
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}