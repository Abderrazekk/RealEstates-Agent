import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/90"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4 animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            About Us
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto">
            Redefining luxury real estate for over 25 years
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 -mt-20 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "500+", label: "Properties Sold", icon: "🏠" },
              { number: "98%", label: "Client Satisfaction", icon: "⭐" },
              { number: "25+", label: "Years Experience", icon: "🎯" },
              { number: "50+", label: "Awards Won", icon: "🏆" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-4 block">
                Our Story
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Building Dreams Since 1998
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Founded in 1998, Premier Estate has grown from a small local
                agency into a premier luxury real estate firm with international
                recognition.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our commitment to exceptional service and deep market
                knowledge has helped thousands of clients find their dream
                properties.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏢</div>
                  <p className="text-gray-700 font-semibold text-lg">
                    Excellence in Real Estate
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
            <span className="text-blue-100 font-semibold text-sm uppercase tracking-wider mb-4 block">
              Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Your Success Is Our Priority
            </h2>
            <p className="text-blue-50 text-lg leading-relaxed max-w-3xl">
              To provide unparalleled real estate services through integrity,
              professionalism, and personalized attention. We believe that
              finding the perfect property should be an exciting and stress-free
              experience.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
