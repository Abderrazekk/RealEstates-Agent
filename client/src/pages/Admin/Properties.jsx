import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api"; // Changed from axios to api
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await api.get("/api/admin/properties");
      setProperties(response.data.data);
      setError(null);
    } catch (error) {
      const errorMessage = error.userMessage || "Failed to fetch properties";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;

    try {
      await api.delete(`/api/properties/${id}`);
      toast.success("Property deleted successfully");
      fetchProperties();
    } catch (error) {
      const errorMessage = error.userMessage || "Failed to delete property";
      toast.error(errorMessage);
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      await api.patch(`/api/admin/properties/${id}/featured`);
      toast.success(
        `Property ${currentStatus ? "removed from" : "added to"} featured`
      );
      fetchProperties();
    } catch (error) {
      const errorMessage = error.userMessage || "Failed to update property";
      toast.error(errorMessage);
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      await api.patch(`/api/admin/properties/${id}/publish`);
      toast.success(`Property ${currentStatus ? "unpublished" : "published"}`);
      fetchProperties();
    } catch (error) {
      const errorMessage = error.userMessage || "Failed to update property";
      toast.error(errorMessage);
    }
  };

  const filteredProperties = properties.filter(
    (property) =>
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error && properties.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
            <p className="font-medium">Error loading properties</p>
            <p className="text-sm mt-2">{error}</p>
            <button
              onClick={fetchProperties}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Property Management
          </h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            onClick={() => navigate("/admin/properties/create")}
          >
            <span className="text-xl">+</span>
            Add New Property
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search properties by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Error Message */}
        {error && properties.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            <p>{error} (showing cached data)</p>
          </div>
        )}

        {/* Properties Table */}
        {filteredProperties.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr
                      key={property._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={
                            property.images[0]?.url ||
                            "/property-placeholder.jpg"
                          }
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "/property-placeholder.jpg";
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {property.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {property.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {property.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${property.price?.toLocaleString() || "0"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            property.status === "For Sale"
                              ? "bg-green-100 text-green-800"
                              : property.status === "For Rent"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            property.isFeatured
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() =>
                            handleToggleFeatured(
                              property._id,
                              property.isFeatured
                            )
                          }
                          title={
                            property.isFeatured
                              ? "Remove from featured"
                              : "Add to featured"
                          }
                        >
                          {property.isFeatured ? "Yes" : "No"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            property.isPublished
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-600 hover:bg-red-200"
                          }`}
                          onClick={() =>
                            handleTogglePublish(
                              property._id,
                              property.isPublished
                            )
                          }
                          title={
                            property.isPublished
                              ? "Unpublish property"
                              : "Publish property"
                          }
                        >
                          {property.isPublished ? "Yes" : "No"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                            onClick={() =>
                              navigate(`/admin/properties/edit/${property._id}`)
                            }
                            title="Edit property"
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                            onClick={() => handleDelete(property._id)}
                            title="Delete property"
                          >
                            Delete
                          </button>
                          <button
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                            onClick={() =>
                              navigate(`/property/${property._id}`)
                            }
                            title="View property"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg mb-4">No properties found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Properties Count */}
        <div className="mt-6 text-sm text-gray-500">
          Showing {filteredProperties.length} of {properties.length} properties
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </div>
    </div>
  );
};

export default AdminProperties;
