import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex flex-col">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Premier Estate
            </h1>
            <p className="text-xs text-gray-500 tracking-wide">Luxury Real Estate</p>
          </Link>
          
          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-8">
            <li>
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/properties" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/properties') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Properties
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/about') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/contact') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Contact
              </Link>
            </li>
          </ul>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Sign In
            </button>
            <button className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
              List Your Property
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <Link 
              to="/" 
              className={`block px-4 py-2 rounded-lg ${
                isActive('/') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/properties" 
              className={`block px-4 py-2 rounded-lg ${
                isActive('/properties') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Properties
            </Link>
            <Link 
              to="/about" 
              className={`block px-4 py-2 rounded-lg ${
                isActive('/about') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`block px-4 py-2 rounded-lg ${
                isActive('/contact') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-3 space-y-2">
              <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                Sign In
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                List Your Property
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;