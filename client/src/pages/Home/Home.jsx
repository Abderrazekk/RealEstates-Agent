import React, { useEffect, useState } from "react";
import Hero from "../../components/Hero/Hero";
import FeaturedProperties from "../../components/FeaturedProperties/FeaturedProperties";
import Services from "../../components/Services/Services";
import api from "../../utils/api"; // Replace axios with your API instance

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      // Use the configured API instance instead of axios
      const response = await api.get("/api/properties/featured");
      setFeaturedProperties(response.data.data);
    } catch (error) {
      console.error("Error fetching featured properties:", error);
      setError(error.userMessage || "Failed to load featured properties");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main>
        <Hero />
        <FeaturedProperties
          featuredProperties={featuredProperties}
          loading={loading}
          error={error}
        />
        <Services />

        {/* CTA Section - Modern White Design */}
        <section className="relative py-24 bg-white overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, #4F46E5 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            ></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* Badge */}
              <div className="flex justify-center mb-8">
                <span className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full text-indigo-700 text-sm font-semibold border-2 border-indigo-100 shadow-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Available 24/7 for You
                </span>
              </div>

              {/* Heading */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 text-center leading-tight">
                Let's Find Your
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
                  Dream Property
                </span>
              </h2>

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto leading-relaxed">
                Our expert team is ready to guide you through every step. Get
                personalized assistance and exclusive property recommendations
                tailored to your needs.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <a
                  href="tel:+21622333444"
                  className="group relative px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
                >
                  <span className="relative flex items-center justify-center gap-3">
                    <svg
                      className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span>+216 22 333 444</span>
                  </span>
                </a>

                <a
                  href="https://wa.me/21622333444?text=Hello, I'm interested in your properties"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
                >
                  <span className="relative flex items-center justify-center gap-3">
                    <svg
                      className="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>Chat on WhatsApp</span>
                  </span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100">
                  <svg
                    className="w-5 h-5 text-amber-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">
                    4.9/5 Rating
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">
                    Verified Agency
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">
                    500+ Happy Clients
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
