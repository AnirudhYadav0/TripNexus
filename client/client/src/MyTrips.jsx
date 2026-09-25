import { useEffect, useState } from "react";

/* =====================================================
   DYNAMIC DESTINATION IMAGE
===================================================== */

function getDestinationImage(
  destination
) {
  const cleanDestination =
    destination?.trim() ||
    "India travel";

  return `https://loremflickr.com/1200/800/${encodeURIComponent(
    cleanDestination
  )},india,travel`;
}


/* =====================================================
   MY TRIPS
===================================================== */

function MyTrips({
  user,
  onBack,
  onViewTrip,
}) {
  const [trips, setTrips] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [deleteLoading, setDeleteLoading] =
    useState("");

  const [error, setError] =
    useState("");

  /* =====================================================
     FETCH MY TRIPS
  ===================================================== */

  const fetchSavedTrips =
    async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const token =
        localStorage.getItem(
          "tripnexus_token"
        );

      if (!token) {
        setError(
          "Your session has expired. Please login again."
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "http://localhost:5000/api/saved-trips/user",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to fetch saved trips."
          );
        }

        setTrips(
          data.trips || []
        );
      } catch (error) {
        console.error(
          "❌ Fetch Saved Trips Error:",
          error
        );

        setError(
          error.message ||
            "Unable to load your saved trips."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchSavedTrips();
  }, [user]);


  /* =====================================================
     DELETE TRIP
  ===================================================== */

  const handleDelete =
    async (tripId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this trip?"
        );

      if (!confirmed) {
        return;
      }

      const token =
        localStorage.getItem(
          "tripnexus_token"
        );

      if (!token) {
        alert(
          "Your session has expired. Please login again."
        );

        return;
      }

      try {
        setDeleteLoading(
          tripId
        );

        const response =
          await fetch(
            `http://localhost:5000/api/saved-trips/${tripId}`,
            {
              method:
                "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to delete trip."
          );
        }

        setTrips(
          (previousTrips) =>
            previousTrips.filter(
              (trip) =>
                trip._id !==
                tripId
            )
        );
      } catch (error) {
        console.error(
          "❌ Delete Trip Error:",
          error
        );

        alert(
          error.message ||
            "Failed to delete trip."
        );
      } finally {
        setDeleteLoading("");
      }
    };


  /* =====================================================
     NOT LOGGED IN
  ===================================================== */

  if (!user) {
    return (
      <div
        style={
          styles.page
        }
      >

        <div
          style={
            styles.emptyCard
          }
        >

          <div
            style={
              styles.emptyIcon
            }
          >
            🔐
          </div>

          <h2>
            Please Login
          </h2>

          <p>
            Login to view and
            manage your saved
            trips.
          </p>

          <button
            onClick={onBack}
            style={
              styles.primaryButton
            }
          >
            ← Back to TripNexus
          </button>

        </div>

      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div
      style={
        styles.page
      }
    >

      {/* NAVBAR */}

      <nav
        style={
          styles.navbar
        }
      >

        <button
          onClick={onBack}
          style={
            styles.logoButton
          }
        >

          <span
            style={
              styles.logoIcon
            }
          >
            ✈️
          </span>

          <span>
            TripNexus
          </span>

        </button>

        <button
          onClick={onBack}
          style={
            styles.backButton
          }
        >
          ← Back to Planner
        </button>

      </nav>


      {/* HEADER */}

      <section
        style={
          styles.header
        }
      >

        <div>

          <span
            style={
              styles.label
            }
          >
            YOUR TRAVEL COLLECTION
          </span>

          <h1
            style={
              styles.title
            }
          >
            My Trips
          </h1>

          <p
            style={
              styles.subtitle
            }
          >
            Welcome back,{" "}
            {user.name}. Your
            saved adventures
            are all in one
            place.
          </p>

        </div>

        <button
          onClick={onBack}
          style={
            styles.planButton
          }
        >
          ✦ Plan New Trip
        </button>

      </section>


      {/* ERROR */}

      {error && (
        <div
          style={
            styles.errorBox
          }
        >
          ❌ {error}
        </div>
      )}


      {/* LOADING */}

      {loading ? (
        <div
          style={
            styles.loadingCard
          }
        >

          <div
            style={
              styles.loadingIcon
            }
          >
            ✦
          </div>

          <h2>
            Loading your trips...
          </h2>

          <p>
            Fetching your saved
            adventures from the
            cloud.
          </p>

        </div>
      ) : trips.length === 0 ? (

        /* EMPTY */

        <div
          style={
            styles.emptyCard
          }
        >

          <div
            style={
              styles.emptyIcon
            }
          >
            🧳
          </div>

          <h2>
            No saved trips yet
          </h2>

          <p>
            Your next adventure
            is waiting to be
            planned. Create a
            trip with TripNexus
            AI and save it here.
          </p>

          <button
            onClick={onBack}
            style={
              styles.primaryButton
            }
          >
            ✦ Plan My First Trip
          </button>

        </div>

      ) : (

        /* TRIPS */

        <>

          <div
            style={
              styles.tripCount
            }
          >

            <strong>
              {trips.length}
            </strong>{" "}

            {trips.length ===
            1
              ? "saved trip"
              : "saved trips"}

          </div>


          <div
            style={
              styles.grid
            }
          >

            {trips.map(
              (trip) => (
                <TripCard
                  key={
                    trip._id
                  }
                  trip={trip}
                  onView={() =>
                    onViewTrip(
                      trip
                    )
                  }
                  onDelete={() =>
                    handleDelete(
                      trip._id
                    )
                  }
                  deleting={
                    deleteLoading ===
                    trip._id
                  }
                />
              )
            )}

          </div>

        </>
      )}

    </div>
  );
}


/* =====================================================
   TRIP CARD
===================================================== */

function TripCard({
  trip,
  onView,
  onDelete,
  deleting,
}) {
  const imageUrl =
    getDestinationImage(
      trip.destination
    );

  return (
    <div
      style={
        styles.tripCard
      }
    >

      {/* IMAGE */}

      <div
        style={
          styles.tripImage
        }
      >

        <img
          src={imageUrl}
          alt={`${trip.destination} travel`}
          style={
            styles.image
          }
          onError={(event) => {
            event.currentTarget.src =
              "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85";
          }}
        />

        <div
          style={
            styles.imageGradient
          }
        />

        <div
          style={
            styles.imageContent
          }
        >

          <span
            style={
              styles.destinationBadge
            }
          >
            ✦ AI Planned
          </span>

          <h2>
            {trip.destination}
          </h2>

          <span
            style={
              styles.imageSubtitle
            }
          >
            {trip.days} Days •{" "}
            {trip.travellers} Travellers
          </span>

        </div>

      </div>


      {/* CONTENT */}

      <div
        style={
          styles.cardContent
        }
      >

        <div
          style={
            styles.metaGrid
          }
        >

          {/* Duration */}

          <div
            style={
              styles.metaItem
            }
          >

            <span
              style={
                styles.metaIcon
              }
            >
              📅
            </span>

            <div>

              <small>
                Duration
              </small>

              <strong>
                {trip.days} Days
              </strong>

            </div>

          </div>


          {/* Travellers */}

          <div
            style={
              styles.metaItem
            }
          >

            <span
              style={
                styles.metaIcon
              }
            >
              👥
            </span>

            <div>

              <small>
                Travellers
              </small>

              <strong>
                {
                  trip.travellers
                }
              </strong>

            </div>

          </div>


          {/* Budget */}

          <div
            style={
              styles.metaItem
            }
          >

            <span
              style={
                styles.metaIcon
              }
            >
              💰
            </span>

            <div>

              <small>
                Budget
              </small>

              <strong>
                ₹
                {Number(
                  trip.budget ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

          </div>


          {/* Style */}

          <div
            style={
              styles.metaItem
            }
          >

            <span
              style={
                styles.metaIcon
              }
            >
              ✨
            </span>

            <div>

              <small>
                Style
              </small>

              <strong>
                {
                  trip.travelStyle
                }
              </strong>

            </div>

          </div>

        </div>


        {/* INTEREST */}

        <div
          style={
            styles.interestBox
          }
        >

          <span>
            Interest
          </span>

          <strong>
            {trip.interest}
          </strong>

        </div>


        {/* ACTIONS */}

        <div
          style={
            styles.cardActions
          }
        >

          <button
            onClick={onView}
            style={
              styles.viewButton
            }
          >
            View Trip
            <span>
              →
            </span>
          </button>

          <button
            onClick={onDelete}
            disabled={
              deleting
            }
            style={{
              ...styles.deleteButton,

              opacity:
                deleting
                  ? 0.6
                  : 1,
            }}
          >
            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = {
  page: {
    minHeight:
      "100vh",

    background:
      "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",

    color:
      "#111827",

    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    paddingBottom:
      "80px",
  },

  navbar: {
    height:
      "76px",

    padding:
      "0 6%",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    background:
      "rgba(255,255,255,0.94)",

    borderBottom:
      "1px solid #e5e7eb",

    position:
      "sticky",

    top:
      0,

    zIndex:
      20,

    backdropFilter:
      "blur(12px)",
  },

  logoButton: {
    border:
      "none",

    background:
      "transparent",

    display:
      "flex",

    alignItems:
      "center",

    gap:
      "10px",

    fontSize:
      "21px",

    fontWeight:
      "800",

    color:
      "#111827",

    cursor:
      "pointer",
  },

  logoIcon: {
    width:
      "38px",

    height:
      "38px",

    borderRadius:
      "12px",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    background:
      "#111827",

    color:
      "#ffffff",

    fontSize:
      "18px",
  },

  backButton: {
    border:
      "1px solid #e5e7eb",

    background:
      "#ffffff",

    color:
      "#374151",

    borderRadius:
      "12px",

    padding:
      "10px 16px",

    fontWeight:
      "600",

    cursor:
      "pointer",
  },

  header: {
    maxWidth:
      "1180px",

    margin:
      "0 auto",

    padding:
      "75px 24px 40px",

    display:
      "flex",

    alignItems:
      "flex-end",

    justifyContent:
      "space-between",

    gap:
      "30px",
  },

  label: {
    fontSize:
      "12px",

    fontWeight:
      "800",

    letterSpacing:
      "2px",

    color:
      "#64748b",
  },

  title: {
    fontSize:
      "52px",

    lineHeight:
      "1",

    margin:
      "12px 0 16px",

    letterSpacing:
      "-2px",
  },

  subtitle: {
    color:
      "#64748b",

    fontSize:
      "16px",

    lineHeight:
      "1.7",

    margin:
      0,

    maxWidth:
      "600px",
  },

  planButton: {
    border:
      "none",

    background:
      "#111827",

    color:
      "#ffffff",

    padding:
      "14px 20px",

    borderRadius:
      "14px",

    fontWeight:
      "700",

    cursor:
      "pointer",

    whiteSpace:
      "nowrap",

    boxShadow:
      "0 10px 25px rgba(15,23,42,0.15)",
  },

  tripCount: {
    maxWidth:
      "1180px",

    margin:
      "0 auto 18px",

    padding:
      "0 24px",

    color:
      "#64748b",

    fontSize:
      "14px",
  },

  grid: {
    maxWidth:
      "1180px",

    margin:
      "0 auto",

    padding:
      "0 24px",

    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(330px, 1fr))",

    gap:
      "25px",
  },

  tripCard: {
    background:
      "#ffffff",

    border:
      "1px solid #e5e7eb",

    borderRadius:
      "24px",

    overflow:
      "hidden",

    boxShadow:
      "0 15px 40px rgba(15,23,42,0.08)",
  },

  tripImage: {
    height:
      "245px",

    position:
      "relative",

    overflow:
      "hidden",

    background:
      "#0f172a",
  },

  image: {
    width:
      "100%",

    height:
      "100%",

    objectFit:
      "cover",

    display:
      "block",
  },

  imageGradient: {
    position:
      "absolute",

    inset:
      0,

    background:
      "linear-gradient(to bottom, rgba(15,23,42,0.05) 20%, rgba(15,23,42,0.82) 100%)",
  },

  imageContent: {
    position:
      "absolute",

    left:
      "22px",

    right:
      "22px",

    bottom:
      "20px",

    color:
      "#ffffff",
  },

  destinationBadge: {
    display:
      "inline-block",

    marginBottom:
      "12px",

    padding:
      "7px 11px",

    borderRadius:
      "999px",

    background:
      "rgba(255,255,255,0.18)",

    border:
      "1px solid rgba(255,255,255,0.18)",

    backdropFilter:
      "blur(8px)",

    fontSize:
      "11px",

    fontWeight:
      "700",
  },

  imageSubtitle: {
    fontSize:
      "13px",

    opacity:
      0.85,
  },

  cardContent: {
    padding:
      "22px",
  },

  metaGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "1fr 1fr",

    gap:
      "15px",
  },

  metaItem: {
    display:
      "flex",

    alignItems:
      "center",

    gap:
      "10px",

    minWidth:
      0,
  },

  metaIcon: {
    width:
      "34px",

    height:
      "34px",

    borderRadius:
      "10px",

    background:
      "#f1f5f9",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    flexShrink:
      0,

    fontSize:
      "14px",
  },

  interestBox: {
    marginTop:
      "20px",

    padding:
      "14px 16px",

    borderRadius:
      "12px",

    background:
      "#f8fafc",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    fontSize:
      "13px",
  },

  cardActions: {
    display:
      "flex",

    gap:
      "10px",

    marginTop:
      "20px",
  },

  viewButton: {
    flex:
      1,

    border:
      "none",

    background:
      "#111827",

    color:
      "#ffffff",

    padding:
      "13px",

    borderRadius:
      "12px",

    fontWeight:
      "700",

    cursor:
      "pointer",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap:
      "8px",
  },

  deleteButton: {
    border:
      "1px solid #fecaca",

    background:
      "#fffafa",

    color:
      "#dc2626",

    padding:
      "13px 16px",

    borderRadius:
      "12px",

    fontWeight:
      "700",

    cursor:
      "pointer",
  },

  loadingCard: {
    maxWidth:
      "600px",

    margin:
      "50px auto",

    padding:
      "60px 30px",

    textAlign:
      "center",

    background:
      "#ffffff",

    border:
      "1px solid #e5e7eb",

    borderRadius:
      "24px",
  },

  loadingIcon: {
    fontSize:
      "35px",

    marginBottom:
      "15px",
  },

  emptyCard: {
    maxWidth:
      "650px",

    margin:
      "50px auto",

    padding:
      "65px 30px",

    textAlign:
      "center",

    background:
      "#ffffff",

    border:
      "1px solid #e5e7eb",

    borderRadius:
      "24px",

    boxShadow:
      "0 12px 35px rgba(15,23,42,0.06)",
  },

  emptyIcon: {
    fontSize:
      "52px",

    marginBottom:
      "18px",
  },

  primaryButton: {
    marginTop:
      "20px",

    border:
      "none",

    background:
      "#111827",

    color:
      "#ffffff",

    padding:
      "14px 20px",

    borderRadius:
      "13px",

    fontWeight:
      "700",

    cursor:
      "pointer",
  },

  errorBox: {
    maxWidth:
      "1180px",

    margin:
      "0 auto 25px",

    padding:
      "14px 18px",

    borderRadius:
      "12px",

    background:
      "#fef2f2",

    color:
      "#b91c1c",

    fontWeight:
      "600",
  },
};

export default MyTrips;