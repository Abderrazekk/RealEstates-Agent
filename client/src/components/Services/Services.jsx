import React from 'react';

const Services = () => {
  const services = [
    {
      icon: '🏠',
      title: 'Property Sales',
      description: 'Find your dream home with our extensive property listings and expert guidance.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '💰',
      title: 'Property Valuation',
      description: 'Get accurate property valuations from our certified real estate experts.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: '📋',
      title: 'Legal Assistance',
      description: 'Complete legal support for all your real estate transactions.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: '🔑',
      title: 'Property Management',
      description: 'Professional property management services for landlords and investors.',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
            What We Offer
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Our <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive real estate solutions tailored to exceed your expectations
          </p>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              {/* Icon container */}
              <div className={`relative w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                <span className="text-3xl filter drop-shadow-sm">
                  {service.icon}
                </span>
              </div>
              
              {/* Content */}
              <div className="relative">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {service.description}
                </p>
                
                {/* Learn more link */}
                <div className="flex items-center text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-sm">Learn more</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;