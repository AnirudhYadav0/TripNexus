import SavedTrip from "../models/SavedTrip.js";

/* =====================================================
   SAVE TRIP
===================================================== */

export const saveTrip = async (req, res) => {
  try {
    const {
      destination,
      days,
      travellers,
      budget,
      travelStyle,
      interest,
      itinerary,
      budgetBreakdown,
      insights,
    } = req.body;

    // User comes from JWT middleware
    const userId = req.user.id;

    if (
      !userId ||
      !destination ||
      !days ||
      !travellers ||
      budget === undefined ||
      !travelStyle ||
      !interest ||
      !Array.isArray(itinerary) ||
      !Array.isArray(budgetBreakdown)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide complete trip details.",
      });
    }

    const savedTrip = await SavedTrip.create({
      userId,
      destination,
      days,
      travellers,
      budget,
      travelStyle,
      interest,
      itinerary,
      budgetBreakdown,
      insights: insights || "",
    });

    return res.status(201).json({
      success: true,
      message: "Trip saved successfully.",
      trip: savedTrip,
    });
  } catch (error) {
    console.error(
      "❌ Save Trip Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save trip.",
      error: error.message,
    });
  }
};


/* =====================================================
   GET MY SAVED TRIPS
===================================================== */

export const getSavedTrips = async (req, res) => {
  try {
    // Get user directly from JWT
    const userId = req.user.id;

    const trips = await SavedTrip.find({
      userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      trips,
    });
  } catch (error) {
    console.error(
      "❌ Get Saved Trips Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch saved trips.",
      error: error.message,
    });
  }
};


/* =====================================================
   DELETE SAVED TRIP
===================================================== */

export const deleteSavedTrip = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const userId = req.user.id;

    /*
      IMPORTANT:
      Delete only if the trip belongs
      to the currently logged-in user.
    */

    const deletedTrip =
      await SavedTrip.findOneAndDelete({
        _id: id,
        userId,
      });

    if (!deletedTrip) {
      return res.status(404).json({
        success: false,
        message:
          "Trip not found or you are not authorized to delete it.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Trip deleted successfully.",
    });
  } catch (error) {
    console.error(
      "❌ Delete Trip Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete trip.",
      error: error.message,
    });
  }
};