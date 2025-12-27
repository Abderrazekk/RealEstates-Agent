import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api"; // Changed from axios to api
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext"; // Added useAuth

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Map click handler component
function LocationMarker({ position, setPosition, setFormData }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      // Reverse geocoding to get address
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
        .then((response) => response.json())
        .then((data) => {
          const address = {
            street: data.address.road || "",
            city:
              data.address.city ||
              data.address.town ||
              data.address.village ||
              "",
            state: data.address.state || "",
            zipCode: data.address.postcode || "",
            country: data.address.country || "",
            formattedAddress: data.display_name || "",
          };

          setFormData((prev) => ({
            ...prev,
            address: address,
            coordinates: { lat, lng },
            location: address.city || address.state || "",
          }));
        })
        .catch((error) => {
          console.error("Error reverse geocoding:", error);
          setFormData((prev) => ({
            ...prev,
            coordinates: { lat, lng },
          }));
        });
    },
  });

  return position ? <Marker position={position} /> : null;
}

const PropertyForm = ({ onClose, onSuccess }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth(); // Added useAuth
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Added error state
  const [mapPosition, setMapPosition] = useState([51.505, -0.09]); // Default position
  const [videoFile, setVideoFile] = useState(null);
  const videoRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      formattedAddress: "",
    },
    coordinates: { lat: 0, lng: 0 },
    type: "House",
    status: "For Sale",
    beds: "",
    baths: "",
    sqft: "",
    yearBuilt: "", // Empty string instead of null
    features: [],
    amenities: [],
    images: [],
    video: null,
    agent: {
      name: "",
      email: "",
      phone: "",
      image: "",
    },
  });

  const [featureInput, setFeatureInput] = useState("");
  const [amenityInput, setAmenityInput] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Check authentication and admin status
  useEffect(() => {
    console.log("PropertyForm - User:", user);
    console.log("PropertyForm - isAdmin:", isAdmin ? isAdmin() : false);
    console.log("PropertyForm - Token:", localStorage.getItem("token") ? "Exists" : "Missing");
    
    if (!user) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }
    
    if (isAdmin && !isAdmin()) {
      toast.error("Admin access required");
      navigate("/");
      return;
    }
    
    if (id) {
      fetchProperty();
    }
  }, [id, user, isAdmin, navigate]);

  const fetchProperty = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching property with ID:", id);
      const response = await api.get(`/api/properties/${id}`);
      console.log("Property fetch response:", response.data);
      
      const data = response.data.data;

      // Update map position if coordinates exist
      if (data.coordinates && data.coordinates.lat && data.coordinates.lng) {
        setMapPosition([data.coordinates.lat, data.coordinates.lng]);
      }

      setFormData({
        title: data.title || "",
        description: data.description || "",
        price: data.price || "",
        location: data.location || "",
        address: data.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
          formattedAddress: "",
        },
        coordinates: data.coordinates || { lat: 0, lng: 0 },
        type: data.type || "House",
        status: data.status || "For Sale",
        beds: data.beds || "",
        baths: data.baths || "",
        sqft: data.sqft || "",
        yearBuilt: data.yearBuilt || "",
        features: data.features || [],
        amenities: data.amenities || [],
        images: data.images || [],
        video: data.video || null,
        agent: data.agent || {
          name: "",
          email: "",
          phone: "",
          image: "",
        },
      });
    } catch (error) {
      console.error("Error fetching property:", error);
      const errorMessage = error.userMessage || "Failed to fetch property data";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // If authentication error, redirect to login
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleAgentChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      agent: { ...prev.agent, [name]: value },
    }));
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()],
      }));
      setAmenityInput("");
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Limit to 10 images
    if (imageFiles.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    const newImageFiles = [...imageFiles, ...files];
    setImageFiles(newImageFiles);

    // Create preview URLs
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
      isFeatured: false,
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = [
      "video/mp4",
      "video/mov",
      "video/avi",
      "video/mkv",
      "video/webm",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error(
        "Invalid video format. Please upload MP4, MOV, AVI, MKV, or WEBM"
      );
      return;
    }

    // Check file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video file too large. Maximum size is 100MB");
      return;
    }

    setVideoFile(file);

    // Create video preview
    if (videoRef.current) {
      const videoUrl = URL.createObjectURL(file);
      videoRef.current.src = videoUrl;
    }
  };

  const removeImage = (index) => {
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    const newImagePreviews = imagePreviews.filter((_, i) => i !== index);

    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);

    // Update form data
    if (id) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  };

  const removeVideo = async () => {
    if (id && formData.video) {
      try {
        await api.delete(`/api/properties/${id}/video`);
        setFormData((prev) => ({ ...prev, video: null }));
        setVideoFile(null);
        toast.success("Video removed");
      } catch (error) {
        toast.error(error.userMessage || "Failed to remove video");
      }
    } else {
      setVideoFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication and admin status
    if (!user) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }
    
    if (isAdmin && !isAdmin()) {
      toast.error("Admin access required");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();

      // Prepare data with proper defaults
      const propertyData = {
        title: formData.title || "",
        description: formData.description || "",
        price: formData.price || 0,
        location: formData.location || "",
        address: formData.address,
        coordinates: formData.coordinates,
        type: formData.type || "House",
        status: formData.status || "For Sale",
        beds: formData.beds || 0,
        baths: formData.baths || 0,
        sqft: formData.sqft || 0,
        yearBuilt: formData.yearBuilt || "", // Send empty string if not provided
        features: formData.features,
        amenities: formData.amenities,
        agent: formData.agent,
      };

      // Add all data to FormData
      Object.keys(propertyData).forEach((key) => {
        if (key === "images" || key === "video") {
          return; // Skip, handled separately
        } else if (
          key === "address" ||
          key === "coordinates" ||
          key === "agent" ||
          key === "features" ||
          key === "amenities"
        ) {
          formDataToSend.append(key, JSON.stringify(propertyData[key]));
        } else {
          // Convert to string, use empty string for falsy values except 0
          const value = propertyData[key];
          if (value === 0 || value === "0") {
            formDataToSend.append(key, "0");
          } else {
            formDataToSend.append(key, value?.toString() || "");
          }
        }
      });

      // Add images
      imageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      // Add video if exists
      if (videoFile) {
        formDataToSend.append("video", videoFile);
      }

      console.log("Submitting property data:", propertyData);
      console.log("API URL base:", process.env.REACT_APP_API_URL);
      console.log("User token:", localStorage.getItem("token")?.substring(0, 20) + "...");

      let response;
      
      if (id) {
        console.log("Making PUT request to:", `/api/properties/${id}`);
        response = await api.put(`/api/properties/${id}`, formDataToSend);
        console.log("Update response:", response.data);
        toast.success("Property updated successfully");
      } else {
        response = await api.post("/api/properties", formDataToSend);
        toast.success("Property created successfully");
      }

      if (onSuccess) {
        onSuccess();
      }

      navigate("/admin/properties");
    } catch (error) {
      console.error("Error saving property:", error);
      console.error("Error response:", error.response?.data);
      
      const errorMessage = error.userMessage || 
                          error.response?.data?.message || 
                          "Failed to save property";
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Handle specific errors
      if (error.response?.status === 401) {
        console.warn("Authentication failed, token might be invalid");
        localStorage.removeItem("token");
        toast.error("Session expired. Please login again.");
        setTimeout(() => navigate("/login"), 1500);
      } else if (error.response?.status === 403) {
        toast.error("Access denied. Admin privileges required.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading && !formData.title) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !formData.title && id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            <p className="font-medium">{error}</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Property</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={fetchProperty}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/admin/properties")}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {id ? "Edit Property" : "Add New Property"}
              </h2>
              <p className="text-blue-100 mt-1">
                {id
                  ? "Update property information"
                  : "Fill in the details to create a new listing"}
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/properties")}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
              disabled={loading}
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="flex-1">{error}</span>
              <button 
                onClick={() => setError(null)} 
                className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Basic Information
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter property title"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Describe the property..."
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (TND) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                      TND
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter property price"
                      required
                      min="0"
                      step="any"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter any price value (e.g., 500000, 750000.50, 1250000)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    required
                    disabled={loading}
                  >
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Condo">Condo</option>
                    <option value="Villa">Villa</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    required
                    disabled={loading}
                  >
                    <option value="For Sale">For Sale</option>
                    <option value="For Rent">For Rent</option>
                    <option value="Sold">Sold</option>
                    <option value="Rented">Rented</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Year Built (Optional)
                  </label>
                  <input
                    type="number"
                    name="yearBuilt"
                    value={formData.yearBuilt}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="YYYY"
                    min="1800"
                    max={new Date().getFullYear()}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location with Map */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Location & Map
              </h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City/Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., New York, NY"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Address
                  </label>
                  <input
                    type="text"
                    name="formattedAddress"
                    value={formData.address.formattedAddress}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Click on map to select location"
                    readOnly
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Map */}
              <div className="h-96 rounded-xl overflow-hidden border border-gray-300">
                <MapContainer
                  center={mapPosition}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker
                    position={mapPosition}
                    setPosition={setMapPosition}
                    setFormData={setFormData}
                  />
                </MapContainer>
              </div>

              <p className="text-sm text-gray-600 text-center">
                Click on the map to set the exact property location
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.coordinates.lat}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.coordinates.lng}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.address.street}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Street name"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Property Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bedrooms <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="beds"
                  value={formData.beds}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="0"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bathrooms <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="baths"
                  value={formData.baths}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="0"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Square Feet <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="sqft"
                  value={formData.sqft}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="0"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-yellow-100 rounded-lg p-3 mr-4">
                <svg
                  className="w-6 h-6 text-yellow-600"
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
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Features</h3>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Add a feature (e.g., Swimming Pool)"
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddFeature())
                  }
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 shadow-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-blue-600 hover:text-red-600 hover:bg-red-50 rounded-full p-1 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-pink-100 rounded-lg p-3 mr-4">
                <svg
                  className="w-6 h-6 text-pink-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Amenities</h3>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Add an amenity (e.g., Gym)"
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddAmenity())
                  }
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 rounded-full text-sm font-medium border border-pink-200 shadow-sm"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(index)}
                      className="text-pink-600 hover:text-red-600 hover:bg-red-50 rounded-full p-1 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 rounded-lg p-3 mr-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Property Images
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Upload up to 10 images
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Images ({imagePreviews.length + formData.images.length}
                  /10)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      imagePreviews.length + formData.images.length >= 10 || loading
                    }
                  />
                  {imagePreviews.length + formData.images.length >= 10 && (
                    <p className="text-sm text-red-600 mt-2">
                      Maximum 10 images reached
                    </p>
                  )}
                </div>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Existing images from server */}
                {formData.images.map((image, index) => (
                  <div
                    key={`existing-${index}`}
                    className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <img
                      src={image.url}
                      alt={`Existing ${index}`}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.target.src = "/property-placeholder.jpg";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* New image previews */}
                {imagePreviews.map((image, index) => (
                  <div
                    key={`preview-${index}`}
                    className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <img
                      src={image.url}
                      alt={`Preview ${index}`}
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Property Video
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Upload a video tour (MP4, MOV, AVI, MKV, WEBM - Max 100MB)
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Video
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                />
              </div>

              {/* Video Preview */}
              {(videoFile || formData.video) && (
                <div className="relative">
                  <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      src={
                        videoFile
                          ? URL.createObjectURL(videoFile)
                          : formData.video?.url
                      }
                      controls
                      className="w-full h-full object-contain"
                      poster={formData.video?.thumbnail}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Agent Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-indigo-100 rounded-lg p-3 mr-4">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Agent Information (Optional)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Fill in agent details if available
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Agent Name (Optional)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.agent.name}
                  onChange={handleAgentChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Agent Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.agent.email}
                  onChange={handleAgentChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="agent@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Agent Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.agent.phone}
                  onChange={handleAgentChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="+1 (555) 123-4567"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Agent Image URL (Optional)
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.agent.image}
                  onChange={handleAgentChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://example.com/agent.jpg"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex justify-end gap-4 sticky bottom-4">
            <button
              type="button"
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => navigate("/admin/properties")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  {id ? "Update Property" : "Create Property"}
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;