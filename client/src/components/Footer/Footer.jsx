import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              SandraImmobiliere
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted partner in finding premium real estate properties.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                📘
              </a>
              <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-sky-500 flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                🐦
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                📷
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"><span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Home</Link></li>
              <li><Link to="/properties" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"><span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Properties</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"><span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"><span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Services</h4>
            <ul className="space-y-2">
              <li><Link to="/properties" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"><span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Property Sales</Link></li>
              <li><Link to="/properties?type=Rental" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"><span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Property Rental</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"><span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Property Management</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"><span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Legal Services</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Info</h4>
            <ul className="space-y-3">
              <li className="text-sm text-gray-400 flex items-start"><span className="mr-2 text-blue-400">📍</span><span>Kalaat-el-Andalous, Ariana, TN</span></li>
              <li className="text-sm text-gray-400 flex items-center"><span className="mr-2 text-green-400">📞</span>+216 22333444</li>
              <li className="text-sm text-gray-400 flex items-center"><span className="mr-2 text-purple-400">✉️</span>info@gmail.com</li>
              <li className="text-sm text-gray-400 flex items-center"><span className="mr-2 text-yellow-400">🕒</span>Mon-Fri: 9AM-6PM</li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} SandraImmobiliere. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;