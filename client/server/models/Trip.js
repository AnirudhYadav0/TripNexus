import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const budgetBreakdownSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },

    percentage: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    days: {
      type: Number,
      required: true,
      min: 1,
    },

    travellers: {
      type: Number,
      required: true,
      min: 1,
    },

    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    travelStyle: {
      type: String,
      required: true,
      trim: true,
    },

    interest: {
      type: String,
      required: true,
      trim: true,
    },

    itinerary: {
      type: [itinerarySchema],
      required: true,
    },

    budgetBreakdown: {
      type: [budgetBreakdownSchema],
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

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;