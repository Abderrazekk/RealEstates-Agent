import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/properties');
    } else {
      navigate('/register');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Text */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                #1 Real Estate Platform
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Find Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Perfect Home
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
              Discover premium properties tailored to your lifestyle. 
              From luxury villas to modern apartments, we have it all.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-6">
              <div className="text-center transform hover:scale-105 transition-transform">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900">500+</h3>
                <p className="text-sm md:text-base text-gray-600 mt-1">Properties</p>
              </div>
              <div className="text-center transform hover:scale-105 transition-transform">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900">98%</h3>
                <p className="text-sm md:text-base text-gray-600 mt-1">Satisfaction</p>
              </div>
              <div className="text-center transform hover:scale-105 transition-transform">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900">15+</h3>
                <p className="text-sm md:text-base text-gray-600 mt-1">Years Exp.</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                onClick={handleGetStarted}
              >
                {user ? 'Browse Properties' : 'Get Started'}
              </button>
              <button 
                className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
                onClick={() => navigate('/about')}
              >
                Learn More
              </button>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative lg:h-[600px] animate-fade-in animation-delay-300">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl transform rotate-3"></div>
            <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Luxury Home"
                className="w-full h-full object-cover"
              />
              {/* Overlay badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Featured Property</p>
                    <h4 className="text-lg font-bold text-gray-900">Modern Villa</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">$2.5M</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;