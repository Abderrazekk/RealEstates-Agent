import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    propertyTitle: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Optional if user is logged in
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    userPhone: {
      type: String,
      required: true,
    },
    meetingDate: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    adminResponse: {
      type: String,
      default: "",
    },
    respondedAt: {
      type: Date,
      default: null,
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

// Indexes for better query performance
meetingSchema.index({ property: 1, status: 1 });
meetingSchema.index({ userEmail: 1 });
meetingSchema.index({ meetingDate: 1 });
meetingSchema.index({ status: 1, createdAt: -1 });

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
