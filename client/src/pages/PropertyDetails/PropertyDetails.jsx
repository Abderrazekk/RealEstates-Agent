import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../utils/api"; // Changed from axios to api
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ReactPlayer from "react-player";

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false); // Added loading for similar properties
  const [tourForm, setTourForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    date: "",
    time: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [meetingSuccess, setMeetingSuccess] = useState(false);

  const fetchProperty = useCallback(async () => {
    try {
      const response = await api.get(`/api/properties/${id}`);
      setProperty(response.data.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching property:", error);
      setError(error.userMessage || "Failed to load property details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const fetchSimilarProperties = useCallback(async () => {
    setSimilarLoading(true);
    try {
      const response = await api.get(`/api/properties/${id}/similar`);
      setSimilarProperties(response.data.data);
    } catch (error) {
      console.error("Error fetching similar properties:", error);
    } finally {
      setSimilarLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (property) {
      fetchSimilarProperties();
    }
  }, [property, fetchSimilarProperties]);

  const formatPrice = (price) => {
    if (!price || isNaN(price) || price <= 0) {
      return "Price on request";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    if (property?.images?.length > 0) {
      setActiveImageIndex((prevIndex) =>
        prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images?.length > 0) {
      setActiveImageIndex((prevIndex) =>
        prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleTourSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to schedule a meeting");
      navigate("/login");
      return;
    }

    if (!tourForm.date || !tourForm.time) {
      toast.error("Please select both date and time");
      return;
    }

    const meetingDateTime = new Date(`${tourForm.date}T${tourForm.time}`);

    if (meetingDateTime <= new Date()) {
      toast.error("Please select a future date and time");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/api/meetings", {
        propertyId: id,
        userName: user.name,
        userPhone: tourForm.phone,
        meetingDate: meetingDateTime.toISOString(),
        notes: tourForm.notes,
      });

      toast.success(
        response.data.message || "Meeting request submitted successfully!"
      );
      setMeetingSuccess(true);

      setTourForm({
        name: user?.name || "",
        phone: user?.phone || "",
        date: "",
        time: "",
        notes: "",
      });
    } catch (error) {
      const errorMessage =
        error.userMessage ||
        error.response?.data?.message ||
        "Failed to schedule meeting";
      toast.error(errorMessage);
      console.error("Error scheduling meeting:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactAgent = () => {
    if (!user) {
      toast.error("Please login to contact agent");
      navigate("/login");
      return;
    }

    if (property?.agent?.phone) {
      window.location.href = `tel:${property.agent.phone}`;
    } else {
      toast.info("Agent phone number not available");
    }
  };

  const handleDeleteProperty = async () => {
    if (!isAdmin()) {
      toast.error("Only admins can delete properties");
      return;
    }

    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await api.delete(`/api/properties/${id}`);
        toast.success("Property deleted successfully");
        navigate("/properties");
      } catch (error) {
        toast.error(error.userMessage || "Failed to delete property");
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4 max-w-md">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            <p className="font-medium">{error}</p>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Property Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The property you're looking for doesn't exist or cannot be loaded.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/properties"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Properties
            </Link>
            <button
              onClick={fetchProperty}
              className="inline-block bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Property Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The property you're looking for doesn't exist.
          </p>
          <Link
            to="/properties"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Property Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-blue-600 transition">
              Home
            </Link>
            <span>/</span>
            <Link to="/properties" className="hover:text-blue-600 transition">
              Properties
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">{property.title}</span>
          </nav>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <div className="flex">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">
                  {error} (some features may be limited)
                </span>
                <button
                  onClick={fetchProperty}
                  className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Title and Meta */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {property.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {property.location}
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(property.price)}
                </span>
              </div>
            </div>

            {isAdmin() && (
              <div className="flex gap-3">
                <Link
                  to={`/admin/properties/edit/${property._id}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Edit Property
                </Link>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  onClick={handleDeleteProperty}
                >
                  Delete Property
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Image Gallery */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Main Image with Navigation */}
              <div className="relative aspect-video w-full bg-gray-200">
                {property.images && property.images.length > 0 ? (
                  <>
                    <img
                      src={
                        property.images[activeImageIndex]?.url ||
                        "/property-placeholder.jpg"
                      }
                      alt={`${property.title} - View ${activeImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/property-placeholder.jpg";
                      }}
                    />

                    {/* Navigation Arrows */}
                    {property.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {activeImageIndex + 1} / {property.images.length}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No images available</span>
                  </div>
                )}
              </div>

              {/* Image Thumbnails - Scrollable */}
              {property.images.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {property.images.map((img, index) => (
                      <button
                        key={index}
                        className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          index === activeImageIndex
                            ? "border-blue-600 ring-2 ring-blue-300"
                            : "border-transparent hover:border-gray-300"
                        }`}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img
                          src={img.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.src = "/property-placeholder.jpg";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Video Section */}
            {property.video && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Virtual Tour
                </h2>
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                  <ReactPlayer
                    url={property.video.url}
                    controls
                    width="100%"
                    height="100%"
                    config={{
                      file: {
                        attributes: {
                          controlsList: "nodownload",
                          poster: property.video.thumbnail,
                        },
                      },
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Property video tour - Click play to watch
                </p>
              </div>
            )}

            {/* Property Info Grid */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Property Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Property Type</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {property.type}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      property.status === "For Sale"
                        ? "bg-green-100 text-green-800"
                        : property.status === "For Rent"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {property.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {property.beds || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Bathrooms</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {property.baths || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Square Feet</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {property.sqft ? property.sqft.toLocaleString() : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Year Built</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {property.yearBuilt || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description || "No description available."}
              </p>
            </div>

            {/* Features & Amenities */}
            {(property.features?.length > 0 ||
              property.amenities?.length > 0) && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Features & Amenities
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {property.features?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Property Features
                      </h3>
                      <ul className="space-y-2">
                        {property.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-gray-700"
                          >
                            <svg
                              className="w-5 h-5 text-green-500 mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {property.amenities?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Amenities
                      </h3>
                      <ul className="space-y-2">
                        {property.amenities.map((amenity, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-gray-700"
                          >
                            <svg
                              className="w-5 h-5 text-green-500 mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {amenity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Map Section */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Location
              </h2>

              {/* Address Details */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-800">Address</h3>
                    <p className="text-gray-700">
                      {property.address?.formattedAddress ||
                        (property.address?.street &&
                          `${property.address.street}, ${
                            property.address.city || ""
                          }, ${property.address.state || ""} ${
                            property.address.zipCode || ""
                          }`) ||
                        property.location ||
                        "Address not available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="h-96 rounded-xl overflow-hidden border border-gray-300">
                {property.coordinates &&
                property.coordinates.lat &&
                property.coordinates.lng ? (
                  <MapContainer
                    center={[
                      property.coordinates.lat,
                      property.coordinates.lng,
                    ]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[
                        property.coordinates.lat,
                        property.coordinates.lng,
                      ]}
                    >
                      <Popup>
                        <div className="p-2">
                          <strong>{property.title}</strong>
                          <p className="text-sm mt-1">{property.location}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V7.618a1 1 0 011.447-.894L9 10m0 0l2.553-1.276a1 1 0 011.094.106l4.354 3.645M9 10V4a1 1 0 011-1h4a1 1 0 011 1v6m-6 0h6m-6 0v10"
                        />
                      </svg>
                      <p>Location map not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Controls */}
              <div className="mt-4 flex justify-center space-x-4">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${
                    property.coordinates?.lat || ""
                  },${property.coordinates?.lng || ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  disabled={
                    !property.coordinates?.lat || !property.coordinates?.lng
                  }
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            {property.agent && (
              <div className="bg-white rounded-2xl shadow-md p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Contact Agent
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={property.agent.image || "/agent-placeholder.jpg"}
                    alt={property.agent.name}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = "/agent-placeholder.jpg";
                    }}
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {property.agent.name || "Agent Name"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Licensed Real Estate Agent
                    </p>
                  </div>
                </div>

                {(property.agent.phone || property.agent.email) && (
                  <div className="space-y-2 mb-4 pb-4 border-b">
                    {property.agent.phone && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Phone:</span>{" "}
                        {property.agent.phone}
                      </p>
                    )}
                    {property.agent.email && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span>{" "}
                        {property.agent.email}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  {property.agent.phone && (
                    <button
                      onClick={handleContactAgent}
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      Call Now
                    </button>
                  )}
                  <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Send Message
                  </button>
                </div>
              </div>
            )}

            {/* Schedule Tour */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Schedule a Meeting
              </h3>

              {meetingSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Meeting Request Submitted!
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Your meeting request has been sent to the agent. You'll
                    receive an email confirmation once it's approved.
                  </p>
                  <button
                    onClick={() => setMeetingSuccess(false)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Schedule Another Meeting
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTourSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={tourForm.name}
                    onChange={(e) =>
                      setTourForm({ ...tourForm, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={tourForm.phone}
                    onChange={(e) =>
                      setTourForm({ ...tourForm, phone: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={tourForm.date}
                        onChange={(e) =>
                          setTourForm({ ...tourForm, date: e.target.value })
                        }
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={tourForm.time}
                        onChange={(e) =>
                          setTourForm({ ...tourForm, time: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {["Morning", "Afternoon", "Evening"].map((timeSlot) => (
                        <button
                          key={timeSlot}
                          type="button"
                          onClick={() => {
                            let time = "";
                            switch (timeSlot) {
                              case "Morning":
                                time = "09:00";
                                break;
                              case "Afternoon":
                                time = "14:00";
                                break;
                              case "Evening":
                                time = "17:00";
                                break;
                              default:
                                time = "09:00";
                                break;
                            }
                            setTourForm({ ...tourForm, time });
                          }}
                          className={`py-2 text-sm rounded-lg border transition ${
                            (timeSlot === "Morning" &&
                              tourForm.time === "09:00") ||
                            (timeSlot === "Afternoon" &&
                              tourForm.time === "14:00") ||
                            (timeSlot === "Evening" &&
                              tourForm.time === "17:00")
                              ? "bg-blue-100 border-blue-500 text-blue-700"
                              : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {timeSlot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    placeholder="Additional Notes (optional)"
                    value={tourForm.notes}
                    onChange={(e) =>
                      setTourForm({ ...tourForm, notes: e.target.value })
                    }
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  ></textarea>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                      submitting
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white`}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Request Meeting
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    The agent will review your request and confirm via email
                    within 24 hours.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Similar Properties
              </h2>
              {similarLoading && (
                <div className="text-sm text-gray-500 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Loading...
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((relatedProperty) => (
                <div
                  key={relatedProperty._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group"
                >
                  <div className="aspect-video w-full bg-gray-200 overflow-hidden">
                    <img
                      src={
                        relatedProperty.images[0]?.url ||
                        "/property-placeholder.jpg"
                      }
                      alt={relatedProperty.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.src = "/property-placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                      {relatedProperty.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {relatedProperty.location}
                    </p>
                    <p className="text-blue-600 font-bold text-xl mb-4">
                      {formatPrice(relatedProperty.price)}
                    </p>
                    <Link
                      to={`/property/${relatedProperty._id}`}
                      className="block w-full text-center bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;
