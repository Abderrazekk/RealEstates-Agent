import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import PropertyFilter from '../../components/PropertyFilter/PropertyFilter';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });

  const [propertyTypes, setPropertyTypes] = useState(['All', 'House', 'Apartment', 'Condo', 'Villa', 'Townhouse', 'Commercial']);
  const [priceRanges, setPriceRanges] = useState([
    { label: 'All Prices', min: 0, max: Infinity },
    { label: '$0 - $100,000', min: 0, max: 100000 },
    { label: '$100,000 - $300,000', min: 100000, max: 300000 },
    { label: '$300,000 - $500,000', min: 300000, max: 500000 },
    { label: '$500,000 - $1,000,000', min: 500000, max: 1000000 },
    { label: '$1,000,000+', min: 1000000, max: Infinity }
  ]);

  const [filters, setFilters] = useState({
    type: 'All',
    priceRange: 'All Prices',
    beds: '',
    baths: '',
    search: ''
  });

  const filterProperties = async (filterData = filters) => {
    setLoading(true);
    
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        order: 'desc',
        ...(filterData.type !== 'All' && { type: filterData.type }),
        ...(filterData.search && { search: filterData.search }),
        ...(filterData.beds && { beds: filterData.beds }),
        ...(filterData.baths && { baths: filterData.baths })
      };
      
      if (filterData.priceRange !== 'All Prices') {
        const range = priceRanges.find(r => r.label === filterData.priceRange);
        if (range) {
          params.minPrice = range.min;
          params.maxPrice = range.max;
        }
      }
      
      const response = await axios.get('/api/properties', { params });
      setProperties(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterProperties();
  }, [sortBy, pagination.page]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    filterProperties(newFilters);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Premium Properties</h1>
            <p className="text-xl md:text-2xl text-blue-100">Discover our curated collection of luxury real estate</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Section */}
        <div className="mb-8">
          <PropertyFilter 
            onFilterChange={handleFilterChange}
            propertyTypes={propertyTypes}
            priceRanges={priceRanges}
            initialFilters={filters}
          />
        </div>

        {/* Results Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4 md:mb-0">
            <h3 className="text-2xl font-bold text-gray-800">{pagination.total} Properties Found</h3>
            <p className="text-gray-600 mt-1">Showing {properties.length} properties</p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-gray-700 font-medium">Sort by:</label>
            <select 
              value={sortBy} 
              onChange={handleSortChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-700"
            >
              <option value="createdAt">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="sqft">Largest First</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {properties.map(property => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .slice(Math.max(0, pagination.page - 3), Math.min(pagination.pages, pagination.page + 2))
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        pagination.page === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No properties found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;