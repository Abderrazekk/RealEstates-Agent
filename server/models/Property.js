import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Minimum is 0, but user can input any value
    },
    location: {
      type: String,
      required: true,
    },
    // Updated address fields with map coordinates
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: '' },
      formattedAddress: { type: String, default: '' },
    },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    type: {
      type: String,
      enum: ["House", "Apartment", "Condo", "Villa", "Townhouse", "Commercial"],
      required: true,
    },
    status: {
      type: String,
      enum: ["For Sale", "For Rent", "Sold", "Rented"],
      default: "For Sale",
    },
    beds: {
      type: Number,
      required: true,
      min: 0,
    },
    baths: {
      type: Number,
      required: true,
      min: 0,
    },
    sqft: {
      type: Number,
      required: true,
      min: 0,
    },
    yearBuilt: {
      type: Number,
      default: null,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        isFeatured: {
          type: Boolean,
          default: false,
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    // Video field
    video: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      thumbnail: { type: String, default: '' },
      duration: { type: Number, default: 0 },
    },
    features: [
      {
        type: String,
      },
    ],
    amenities: [
      {
        type: String,
      },
    ],
    agent: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      image: { type: String, default: '' },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
propertySchema.index({ type: 1, price: 1 });
propertySchema.index({ location: "text", title: "text", description: "text" });
propertySchema.index({ status: 1, isPublished: 1 });
propertySchema.index({ coordinates: "2dsphere" });

const Property = mongoose.model("Property", propertySchema);

export default Property;