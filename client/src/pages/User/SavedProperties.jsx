import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';

const SavedProperties = () => {
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedProperties();
  }, []);

  const fetchSavedProperties = async () => {
    try {
      const response = await api.get('/api/users/saved-properties');
      setSavedProperties(response.data.data);
    } catch (error) {
      console.error('Error fetching saved properties:', error);
      if (error.userMessage) {
        toast.error(error.userMessage);
      } else {
        toast.error('Failed to load saved properties');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (propertyId) => {
    try {
      await api.delete(`/api/users/unsave-property/${propertyId}`);
      setSavedProperties(prev => prev.filter(p => p._id !== propertyId));
      toast.success('Property removed from saved list');
    } catch (error) {
      console.error('Error removing saved property:', error);
      if (error.userMessage) {
        toast.error(error.userMessage);
      } else {
        toast.error('Failed to remove property');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading saved properties..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Saved Properties</h1>
          <p className="text-lg text-gray-600">Your favorite properties in one place</p>
        </div>

        {savedProperties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mb-6">
              <span className="text-5xl">❤️</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No saved properties yet</h3>
            <p className="text-gray-600 mb-8">Start exploring and save your favorite properties to view them here</p>
            <a href="/properties" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
              Browse Properties
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        ) : (
          <>
            {/* Count Badge */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-white rounded-full shadow-md px-6 py-3 flex items-center space-x-2">
                <span className="text-gray-700">You have saved</span>
                <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                  {savedProperties.length}
                </span>
                <span className="text-gray-700">propert{savedProperties.length === 1 ? 'y' : 'ies'}</span>
              </div>
            </div>
            
            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map(property => (
                <div key={property._id} className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                  <PropertyCard property={property} />
                  <div className="p-4 bg-gradient-to-t from-white to-transparent">
                    <button
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors duration-200 border border-red-200 hover:border-red-300"
                      onClick={() => handleRemoveSaved(property._id)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Remove from Saved</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SavedProperties;