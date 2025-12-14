import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  X,
  ChevronDown,
  User,
  Home,
  Building,
  Info,
  Shield,
  Heart,
  LogOut,
  Phone,
  Mail,
  MapPin,
  Bell,
} from "lucide-react";

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsUserMenuOpen(false);
  };

  return (
    <>
      {/* Top Contact Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>+216 22333444</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@gmail.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Kalaat-el-Andalous, Ariana, TN</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center hover:text-blue-200 transition-colors">
                <Bell className="w-4 h-4 mr-1" />
                <span>Alerts</span>
              </button>
              <div className="h-4 w-px bg-blue-700"></div>
              <span className="text-blue-300">24/7 Customer Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Luxury<span className="text-blue-600">Estates</span>
                  </h1>
                  <p className="text-xs text-gray-500 tracking-widest uppercase">
                    Premium Properties
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors group"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
                <div className="h-0.5 w-0 group-hover:w-full bg-blue-600 transition-all duration-300"></div>
              </Link>
              <Link
                to="/properties"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors group"
              >
                <Building className="w-4 h-4" />
                <span>Properties</span>
                <div className="h-0.5 w-0 group-hover:w-full bg-blue-600 transition-all duration-300"></div>
              </Link>
              <Link
                to="/about"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors group"
              >
                <Info className="w-4 h-4" />
                <span>About</span>
                <div className="h-0.5 w-0 group-hover:w-full bg-blue-600 transition-all duration-300"></div>
              </Link>

              {isAdmin() && (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="py-2">
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/admin/properties"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span>Properties</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-full hover:bg-gray-100 transition-colors group"
                  >
                    <div className="relative">
                      <img
                        src={user.profilePicture || "/default-avatar.png"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full border-2 border-white shadow-md group-hover:border-blue-200 transition-colors"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                        <div className="p-4 border-b">
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.profilePicture || "/default-avatar.png"}
                              alt={user.name}
                              className="w-12 h-12 rounded-full"
                            />
                            <div>
                              <div className="font-semibold text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <User className="w-5 h-5" />
                            <span>My Profile</span>
                          </Link>

                          <Link
                            to="/my-meetings"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            📅 My Meetings
                          </Link>
                          <Link
                            to="/saved"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <Heart className="w-5 h-5" />
                            <span>Saved Properties</span>
                          </Link>
                          {isAdmin() && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Shield className="w-5 h-5" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                        </div>

                        <div className="border-t py-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-2.5 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors hidden md:block"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg hidden md:block"
                  >
                    Sign Up
                  </button>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-6">
              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Home</span>
                </Link>
                <Link
                  to="/properties"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Building className="w-5 h-5" />
                  <span className="font-medium">Properties</span>
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Info className="w-5 h-5" />
                  <span className="font-medium">About</span>
                </Link>

                {isAdmin() && (
                  <>
                    <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Admin
                    </div>
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors ml-4"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/admin/properties"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors ml-4"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Properties</span>
                    </Link>
                  </>
                )}

                {!user && (
                  <div className="pt-4 space-y-3">
                    <button
                      onClick={() => {
                        navigate("/login");
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        navigate("/register");
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
