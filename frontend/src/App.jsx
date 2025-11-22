import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import BrowsePage from './pages/BrowsePage';
import ItemDetailPage from './pages/ItemDetailPage';
import DashboardPage from './pages/DashboardPage';
import AddItemPage from './pages/AddItemPage';
import MessagesPage from './pages/MessagesPage';
import RentalDetailPage from './pages/RentalDetailPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/browse" /> : <LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/browse" /> : <LoginPage />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/browse" /> : <SignupPage />} />

        <Route path="/browse" element={<ProtectedRoute><BrowsePage /></ProtectedRoute>} />
        <Route path="/items/:id" element={<ProtectedRoute><ItemDetailPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/add-item" element={<ProtectedRoute><AddItemPage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/rentals/:id" element={<ProtectedRoute><RentalDetailPage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
