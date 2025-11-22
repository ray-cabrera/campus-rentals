import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { messagesAPI } from '../utils/api';
import { Menu, X, Bell, MessageCircle, User, LogOut, Plus, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await messagesAPI.getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                  CR
                </div>
                <span className="text-xl font-bold text-gray-900">Campus Rentals</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                Log In
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/browse" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                CR
              </div>
              <span className="text-xl font-bold text-gray-900">Campus Rentals</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/browse" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Browse
            </Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Dashboard
            </Link>
            <Link to="/add-item" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-colors">
              <Plus size={18} />
              <span>List Item</span>
            </Link>
            <Link to="/messages" className="relative text-gray-700 hover:text-primary-600 transition-colors">
              <MessageCircle size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={18} className="text-primary-600" />
                </div>
                <span className="font-medium">{user?.full_name?.split(' ')[0]}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/browse"
              className="block text-gray-700 hover:text-primary-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse
            </Link>
            <Link
              to="/dashboard"
              className="block text-gray-700 hover:text-primary-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/add-item"
              className="block text-gray-700 hover:text-primary-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              List Item
            </Link>
            <Link
              to="/messages"
              className="block text-gray-700 hover:text-primary-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Messages {unreadCount > 0 && `(${unreadCount})`}
            </Link>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">{user?.full_name}</p>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-sm text-gray-700 hover:text-primary-600 flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
