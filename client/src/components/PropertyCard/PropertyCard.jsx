import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { toast } from "react-toastify";
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Home,
  Star,
  ArrowRight,
} from "lucide-react";

const PropertyCard = ({ property }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSaveProperty = async () => {
    if (!user) {
      toast.error("Please login to save properties");
      return;
    }

    try {
      if (isSaved) {
        await api.delete(`/api/users/unsave-property/${property._id}`);
        setIsSaved(false);
        toast.success("Property removed from saved list");
      } else {
        await api.post(`/api/users/save-property/${property._id}`);
        setIsSaved(true);
        toast.success("Property saved successfully");
      }
    } catch (error) {
      console.error("Error saving property:", error);
      if (error.userMessage) {
        toast.error(error.userMessage);
      } else {
        toast.error("Failed to save property");
      }
    }
  };

  return (
    <div className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 hover:-translate-y-1">
      <div className="relative overflow-hidden h-72">
        <img
          src={property.images[0]?.url || "/property-placeholder.jpg"}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-5 left-5 flex gap-2">
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-md shadow-lg ${
              property.status === "For Sale"
                ? "bg-emerald-500/95"
                : property.status === "For Rent"
                ? "bg-blue-500/95"
                : "bg-purple-500/95"
            }`}
          >
            {property.status}
          </span>
          {property.isFeatured && (
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white backdrop-blur-md shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </span>
          )}
        </div>

        <button
          onClick={handleSaveProperty}
          className={`absolute top-5 right-5 p-3 rounded-full backdrop-blur-xl transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 ${
            isSaved
              ? "bg-red-500 text-white shadow-red-500/50"
              : "bg-white/95 text-gray-700 hover:bg-red-500 hover:text-white hover:shadow-red-500/50"
          }`}
        >
          <Heart
            className="w-5 h-5"
            fill={isSaved ? "currentColor" : "none"}
            strokeWidth={2.5}
          />
        </button>

        <div className="absolute bottom-5 left-5">
          <span className="px-5 py-2.5 bg-black/98 backdrop-blur-md rounded-2xl font-bold text-2xl text-white shadow-xl">
            {formatPrice(property.price)}
          </span>
        </div>
      </div>

      <div className="p-7">
        <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {property.title}
        </h3>

        <div className="flex items-center text-gray-600 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-2 text-blue-500" strokeWidth={2.5} />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
          {property.description}
        </p>

        <div className="grid grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <Bed className="w-6 h-6 text-blue-600" strokeWidth={2} />
            <span className="text-sm font-semibold text-gray-700">
              {property.beds}
            </span>
            <span className="text-xs text-gray-500">Beds</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <Bath className="w-6 h-6 text-blue-600" strokeWidth={2} />
            <span className="text-sm font-semibold text-gray-700">
              {property.baths}
            </span>
            <span className="text-xs text-gray-500">Baths</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <Maximize className="w-6 h-6 text-blue-600" strokeWidth={2} />
            <span className="text-sm font-semibold text-gray-700">
              {property.sqft ? property.sqft.toLocaleString() : "N/A"}
            </span>
            <span className="text-xs text-gray-500">m²</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <Home className="w-6 h-6 text-blue-600" strokeWidth={2} />
            <span className="text-sm font-semibold text-gray-700 line-clamp-1">
              {property.type}
            </span>
            <span className="text-xs text-gray-500">Type</span>
          </div>
        </div>

        <Link
          to={`/property/${property._id}`}
          className="group/btn flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 active:scale-98"
        >
          View Details
          <ArrowRight
            className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300"
            strokeWidth={2.5}
          />
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;
