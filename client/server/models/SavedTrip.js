import mongoose from "mongoose";

const savedTripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    days: {
      type: Number,
      required: true,
    },

    travellers: {
      type: Number,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
    },

    travelStyle: {
      type: String,
      required: true,
    },

    interest: {
      type: String,
      required: true,
    },

    itinerary: {
      type: Array,
      required: true,
    },

    budgetBreakdown: {
      type: Array,
      required: true,
    },

    insights: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const SavedTrip = mongoose.model("SavedTrip", savedTripSchema);

export default SavedTrip;