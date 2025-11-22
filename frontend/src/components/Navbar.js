import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  Search,
  Plus,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  DollarSign,
  Package,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-princeton-orange rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Campus<span className="text-princeton-orange">Rentals</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center ml-8 gap-6">
              <Link
                to="/browse"
                className={`nav-link ${isActive('/browse') ? 'nav-link-active' : ''}`}
              >
                Browse
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/earnings"
                    className={`nav-link ${isActive('/earnings') ? 'nav-link-active' : ''}`}
                  >
                    Earnings
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Search bar - desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for cameras, tools, formal wear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-princeton-orange focus:border-transparent outline-none transition-all"
              />
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Add item button */}
                <Link
                  to="/add-item"
                  className="hidden sm:flex items-center gap-2 btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  <span>List Item</span>
                </Link>

                {/* Messages */}
                <Link
                  to="/messages"
                  className="p-2 text-gray-600 hover:text-princeton-orange hover:bg-gray-50 rounded-lg transition-colors relative"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-princeton-orange rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="dropdown-menu">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{user?.full_name}</p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                      </div>

                      <Link to="/dashboard" className="dropdown-item flex items-center gap-3" onClick={() => setUserMenuOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link to="/my-rentals" className="dropdown-item flex items-center gap-3" onClick={() => setUserMenuOpen(false)}>
                        <Package className="w-4 h-4" />
                        My Rentals
                      </Link>
                      <Link to="/earnings" className="dropdown-item flex items-center gap-3" onClick={() => setUserMenuOpen(false)}>
                        <DollarSign className="w-4 h-4" />
                        Earnings
                      </Link>
                      <Link to={`/profile/${user?.id}`} className="dropdown-item flex items-center gap-3" onClick={() => setUserMenuOpen(false)}>
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link to="/settings" className="dropdown-item flex items-center gap-3" onClick={() => setUserMenuOpen(false)}>
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="dropdown-item flex items-center gap-3 w-full text-left text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link hidden sm:block">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-princeton-orange hover:bg-gray-50 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 animate-slide-down">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-princeton-orange focus:border-transparent outline-none"
                />
              </div>
            </form>

            <div className="space-y-1">
              <Link
                to="/browse"
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Items
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/add-item"
                    className="block px-4 py-3 text-princeton-orange font-semibold hover:bg-orange-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    + List an Item
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/my-rentals"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Rentals
                  </Link>
                  <Link
                    to="/messages"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>
                </>
              )}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
