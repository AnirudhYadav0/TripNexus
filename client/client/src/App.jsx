import { useEffect, useState } from "react";
import { API_BASE_URL } from "./config";
import "./App.css";
import Auth from "./Auth";
import MyTrips from "./MyTrips";

/* =====================================================
   POPULAR DESTINATIONS
===================================================== */

const destinations = [
  {
    name: "Manali",
    subtitle: "Mountains • Snow • Adventure",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Goa",
    subtitle: "Beaches • Nightlife • Relax",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Rajasthan",
    subtitle: "Heritage • Culture • Royal",
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Kashmir",
    subtitle: "Valleys • Lakes • Nature",
    image:
      "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=85",
  },
];

/* =====================================================
   APP
===================================================== */

function App() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [travellers, setTravellers] = useState(2);
  const [budget, setBudget] = useState(15000);
  const [travelStyle, setTravelStyle] =
    useState("Balanced");
  const [interest, setInterest] =
    useState("Nature");

  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);

  /* AUTH */

  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] =
    useState("login");

  /* SAVE TRIP */

  const [saveLoading, setSaveLoading] =
    useState(false);
  const [saveMessage, setSaveMessage] =
    useState("");
  const [saveError, setSaveError] =
    useState("");
  const [isTripSaved, setIsTripSaved] =
    useState(false);

  /* MY TRIPS */

  const [showMyTrips, setShowMyTrips] =
    useState(false);

  const [viewingSavedTrip, setViewingSavedTrip] =
    useState(null);

  /* =====================================================
     RESTORE LOGIN SESSION
  ===================================================== */

  useEffect(() => {
    const savedUser =
      localStorage.getItem("tripnexus_user");

    const token =
      localStorage.getItem("tripnexus_token");

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error(
          "Invalid saved user:",
          error
        );

        localStorage.removeItem(
          "tripnexus_user"
        );

        localStorage.removeItem(
          "tripnexus_token"
        );
      }
    }
  }, []);

  /* =====================================================
     LOGIN SUCCESS
  ===================================================== */

  const handleAuthSuccess = (
    loggedInUser
  ) => {
    setUser(loggedInUser);
    setShowAuth(false);
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem(
      "tripnexus_user"
    );

    localStorage.removeItem(
      "tripnexus_token"
    );

    setUser(null);
    setIsTripSaved(false);
    setSaveMessage("");
    setSaveError("");
    setShowMyTrips(false);
    setViewingSavedTrip(null);
  };

  /* =====================================================
     OPEN MY TRIPS
  ===================================================== */

  const handleOpenMyTrips = () => {
    if (!user) {
      setAuthMode("login");
      setShowAuth(true);
      return;
    }

    setViewingSavedTrip(null);
    setShowMyTrips(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     BACK TO APP
  ===================================================== */

  const handleBackToApp = () => {
    setShowMyTrips(false);
    setViewingSavedTrip(null);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  };

  /* =====================================================
     VIEW SAVED TRIP
  ===================================================== */

  const handleViewSavedTrip = (trip) => {
    setViewingSavedTrip(trip);
  };

  /* =====================================================
     CLOSE SAVED TRIP
  ===================================================== */

  const handleCloseSavedTrip = () => {
    setViewingSavedTrip(null);
  };

  /* =====================================================
     PLAN TRIP
  ===================================================== */

  const handlePlanTrip = async () => {
    if (!destination.trim()) {
      alert("Please enter a destination.");
      return;
    }

    setLoading(true);
    setTripData(null);

    setIsTripSaved(false);
    setSaveMessage("");
    setSaveError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/trips/generate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            destination,
            days: Number(days),
            travellers: Number(travellers),
            budget: Number(budget),
            travelStyle,
            interest,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to generate trip."
        );
      }

      setTripData(data.trip);

      setTimeout(() => {
        document
          .getElementById("ai-result")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (error) {
      console.error(
        "❌ Trip generation error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong while generating your trip."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     SAVE TRIP
  ===================================================== */

  const handleSaveTrip = async () => {
    setSaveMessage("");
    setSaveError("");

    if (!user) {
      setSaveError(
        "Please login to save your trip."
      );

      setAuthMode("login");
      setShowAuth(true);

      return;
    }

    if (!tripData) {
      setSaveError(
        "Please generate a trip first."
      );

      return;
    }

    const token =
      localStorage.getItem(
        "tripnexus_token"
      );

    if (!token) {
      setSaveError(
        "Your session has expired. Please login again."
      );

      handleLogout();

      setAuthMode("login");
      setShowAuth(true);

      return;
    }

    setSaveLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/saved-trips/save`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            destination:
              tripData.destination,

            days: Number(
              tripData.days
            ),

            travellers: Number(
              tripData.travellers
            ),

            budget: Number(
              tripData.budget
            ),

            travelStyle:
              tripData.travelStyle,

            interest:
              tripData.interest,

            itinerary:
              tripData.itinerary,

            budgetBreakdown:
              tripData.budgetBreakdown,

            insights:
              tripData.insights || "",
          }),
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
            "Failed to save trip."
        );
      }

      setIsTripSaved(true);

      setSaveMessage(
        "Trip saved successfully! ❤️"
      );
    } catch (error) {
      console.error(
        "❌ Save trip error:",
        error
      );

      setSaveError(
        error.message ||
          "Failed to save trip."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  /* =====================================================
     MY TRIPS SCREEN
  ===================================================== */

  if (showMyTrips) {
    return (
      <>
        <MyTrips
          user={user}
          onBack={handleBackToApp}
          onViewTrip={
            handleViewSavedTrip
          }
        />

        {viewingSavedTrip && (
          <SavedTripModal
            trip={viewingSavedTrip}
            onClose={
              handleCloseSavedTrip
            }
          />
        )}
      </>
    );
  }

  return (
    <div className="app">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="navbar">

        <div className="nav-logo">
          <div className="logo-icon">
            ✈️
          </div>

          <span>
            TripNexus
          </span>
        </div>

        <div className="nav-links">

          <a href="#home">
            Home
          </a>

          <a href="#explore">
            Explore
          </a>

          <a href="#planner">
            AI Planner
          </a>

          <a href="#features">
            Features
          </a>

          {user && (
            <button
              onClick={
                handleOpenMyTrips
              }
              className="nav-text-button"
            >
              My Trips
            </button>
          )}

        </div>

        <div className="nav-actions">

          {!user ? (
            <>
              <button
                className="nav-login"
                onClick={() => {
                  setAuthMode("login");
                  setShowAuth(true);
                }}
              >
                Log in
              </button>

              <button
                className="nav-start"
                onClick={() => {
                  setAuthMode("register");
                  setShowAuth(true);
                }}
              >
                Get Started
              </button>
            </>
          ) : (
            <>
              <button
                onClick={
                  handleOpenMyTrips
                }
                className="nav-my-trips"
              >
                ❤️ My Trips
              </button>

              <span className="nav-user">
                Hi, {user.name}
              </span>

              <button
                className="nav-login"
                onClick={
                  handleLogout
                }
              >
                Logout
              </button>

              <button
                className="nav-start"
                onClick={() =>
                  document
                    .getElementById(
                      "planner"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    })
                }
              >
                Plan a Trip
              </button>
            </>
          )}

        </div>
      </nav>

      {/* =================================================
          HERO
      ================================================= */}

      <section
        className="hero"
        id="home"
      >

        <div className="hero-content">

          <div className="hero-badge">
            <span>✦</span>
            AI-Powered Travel Planning
          </div>

          <h1>
            Your Journey.
            <br />

            <span>
              Perfectly Planned.
            </span>
          </h1>

          <p className="hero-description">
            Discover destinations,
            build personalized
            itineraries, and plan
            unforgettable journeys
            with the power of AI.
          </p>

          <button
            className="hero-button"
            onClick={() =>
              document
                .getElementById(
                  "planner"
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                })
            }
          >
            Start Planning
            <span>→</span>
          </button>

          <div className="hero-stats">

            <div>
              <strong>
                10K+
              </strong>

              <span>
                Trips Planned
              </span>
            </div>

            <div className="stat-divider" />

            <div>
              <strong>
                50+
              </strong>

              <span>
                Destinations
              </span>
            </div>

            <div className="stat-divider" />

            <div>
              <strong>
                4.9/5
              </strong>

              <span>
                User Rating
              </span>
            </div>

          </div>

        </div>

        <div className="hero-image-wrapper">

          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=90"
            alt="Mountain travel destination"
            className="hero-image"
          />

          <div className="hero-floating-card">

            <div className="floating-icon">
              ✦
            </div>

            <div>
              <strong>
                AI Trip Ready
              </strong>

              <span>
                Personalized for you
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================
          EXPLORE
      ================================================= */}

      <section
        className="explore-section"
        id="explore"
      >

        <div className="section-heading">

          <div>

            <span className="section-label">
              EXPLORE
            </span>

            <h2>
              Popular destinations
            </h2>

          </div>

          <p>
            Get inspired by places
            travelers love.
            <br />
            Your next adventure is
            waiting.
          </p>

        </div>

        <div className="destination-grid">

          {destinations.map(
            (item) => (
              <DestinationCard
                key={item.name}
                {...item}
                onClick={() => {
                  setDestination(
                    item.name
                  );

                  document
                    .getElementById(
                      "planner"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    });
                }}
              />
            )
          )}

        </div>
      </section>

      {/* =================================================
          AI PLANNER
      ================================================= */}

      <section
        className="planner-section"
        id="planner"
      >

        <div className="planner-header">

          <span className="section-label">
            AI TRIP PLANNER
          </span>

          <h2>
            Tell us your travel dream.
          </h2>

          <p>
            Our AI will create a
            personalized itinerary
            just for you.
          </p>

        </div>

        <div className="planner-card">

          <div className="planner-top-line">

            <div>
              <span>
                SMART PLANNING
              </span>

              <h3>
                Build your perfect trip
              </h3>
            </div>

            <div className="planner-ai-status">
              <span />
              AI Ready
            </div>

          </div>

          <div className="planner-grid">

            {/* DESTINATION */}

            <div className="input-group full-width">

              <label>
                Destination
              </label>

              <div className="destination-input-wrap">

                <span>
                  📍
                </span>

                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  value={
                    destination
                  }
                  onChange={(e) =>
                    setDestination(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* DURATION */}

            <div className="input-group">

              <label>
                Duration
              </label>

              <select
                value={days}
                onChange={(e) =>
                  setDays(
                    Number(
                      e.target.value
                    )
                  )
                }
              >
                <option value={1}>
                  1 Day
                </option>

                <option value={2}>
                  2 Days
                </option>

                <option value={3}>
                  3 Days
                </option>

                <option value={4}>
                  4 Days
                </option>

                <option value={5}>
                  5 Days
                </option>

                <option value={6}>
                  6 Days
                </option>

                <option value={7}>
                  7 Days
                </option>

                <option value={10}>
                  10 Days
                </option>

                <option value={14}>
                  14 Days
                </option>
              </select>

            </div>

            {/* TRAVELLERS */}

            <div className="input-group">

              <label>
                Travellers
              </label>

              <select
                value={
                  travellers
                }
                onChange={(e) =>
                  setTravellers(
                    Number(
                      e.target.value
                    )
                  )
                }
              >
                <option value={1}>
                  1 Traveller
                </option>

                <option value={2}>
                  2 Travellers
                </option>

                <option value={3}>
                  3 Travellers
                </option>

                <option value={4}>
                  4 Travellers
                </option>

                <option value={5}>
                  5 Travellers
                </option>

                <option value={6}>
                  6 Travellers
                </option>

                <option value={8}>
                  8 Travellers
                </option>

                <option value={10}>
                  10 Travellers
                </option>
              </select>

            </div>

            {/* BUDGET */}

            <div className="input-group">

              <label>
                Budget
              </label>

              <select
                value={budget}
                onChange={(e) =>
                  setBudget(
                    Number(
                      e.target.value
                    )
                  )
                }
              >
                <option value={5000}>
                  ₹5,000
                </option>

                <option value={10000}>
                  ₹10,000
                </option>

                <option value={15000}>
                  ₹15,000
                </option>

                <option value={25000}>
                  ₹25,000
                </option>

                <option value={50000}>
                  ₹50,000
                </option>

                <option value={100000}>
                  ₹1,00,000
                </option>
              </select>

            </div>

            {/* TRAVEL STYLE */}

            <div className="input-group">

              <label>
                Travel Style
              </label>

              <select
                value={
                  travelStyle
                }
                onChange={(e) =>
                  setTravelStyle(
                    e.target.value
                  )
                }
              >
                <option value="Budget">
                  Budget
                </option>

                <option value="Balanced">
                  Balanced
                </option>

                <option value="Luxury">
                  Luxury
                </option>

                <option value="Adventure">
                  Adventure
                </option>

                <option value="Relaxed">
                  Relaxed
                </option>
              </select>

            </div>

            {/* INTEREST */}

            <div className="input-group full-width">

              <label>
                Interests
              </label>

              <select
                value={
                  interest
                }
                onChange={(e) =>
                  setInterest(
                    e.target.value
                  )
                }
              >
                <option value="Nature">
                  Nature
                </option>

                <option value="Adventure">
                  Adventure
                </option>

                <option value="Culture">
                  Culture & Heritage
                </option>

                <option value="Food">
                  Food
                </option>

                <option value="Beaches">
                  Beaches
                </option>

                <option value="Spiritual">
                  Spiritual
                </option>

                <option value="Photography">
                  Photography
                </option>
              </select>

            </div>

          </div>

          <button
            className="generate-button"
            onClick={
              handlePlanTrip
            }
            disabled={
              loading
            }
          >

            {loading ? (
              <>
                <span>
                  ✦
                </span>

                Creating your trip...

                <span className="button-loading-dot">
                  •
                </span>
              </>
            ) : (
              <>
                <span>
                  ✦
                </span>

                Generate My Trip

                <span>
                  →
                </span>
              </>
            )}

          </button>

        </div>
      </section>

      {/* =================================================
          AI RESULT
      ================================================= */}

      {tripData && (
        <section
          className="ai-result-section"
          id="ai-result"
        >

          <div className="result-header">

            <div>

              <span className="section-label">
                YOUR AI-GENERATED TRIP
              </span>

              <h2>
                {tripData.destination}
              </h2>

              <p>
                {tripData.days} days •{" "}
                {tripData.travellers} travellers •{" "}
                {tripData.travelStyle}
              </p>

            </div>

            <button
              type="button"
              onClick={
                handleSaveTrip
              }
              disabled={
                saveLoading ||
                isTripSaved
              }
              className={
                isTripSaved
                  ? "save-trip-button saved"
                  : "save-trip-button"
              }
            >
              {saveLoading
                ? "Saving..."
                : isTripSaved
                ? "✓ Trip Saved"
                : "💾 Save This Trip"}
            </button>

          </div>

          {saveMessage && (
            <div className="save-message">
              {saveMessage}
            </div>
          )}

          {saveError && (
            <div className="save-error">
              {saveError}
            </div>
          )}

          <div className="result-content">

            <div className="itinerary-card">

              <div className="result-card-heading">

                <span>
                  🗺️
                </span>

                <div>

                  <h3>
                    Your Itinerary
                  </h3>

                  <p>
                    A day-by-day plan
                    crafted by AI
                  </p>

                </div>

              </div>

              <div className="itinerary-list">

                {tripData.itinerary?.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      className="itinerary-item"
                      key={index}
                    >

                      <div className="day-number">
                        {
                          item.day
                        }
                      </div>

                      <div className="day-content">

                        <h4>
                          {
                            item.title
                          }
                        </h4>

                        <p>
                          {
                            item.description
                          }
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>
            </div>

            <div className="budget-card">

              <div className="result-card-heading">

                <span>
                  💰
                </span>

                <div>

                  <h3>
                    Budget Breakdown
                  </h3>

                  <p>
                    Estimated allocation
                    of your budget
                  </p>

                </div>

              </div>

              <div className="budget-total">

                <span>
                  Total Budget
                </span>

                <strong>
                  ₹
                  {Number(
                    tripData.budget ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              <div className="budget-list">

                {tripData.budgetBreakdown?.map(
                  (
                    item,
                    index
                  ) => (
                    <BudgetRow
                      key={index}
                      {...item}
                    />
                  )
                )}

              </div>

              {tripData.insights && (
                <div className="trip-insight">

                  <strong>
                    ✦ AI Insight
                  </strong>

                  <p>
                    {
                      tripData.insights
                    }
                  </p>

                </div>
              )}

            </div>

          </div>
        </section>
      )}

      {/* =================================================
          FEATURES
      ================================================= */}

      <section
        className="features-section"
        id="features"
      >

        <div className="section-heading center">

          <span className="section-label">
            WHY TRIPNEXUS
          </span>

          <h2>
            Everything you need to travel better.
          </h2>

          <p>
            From inspiration to itinerary,
            TripNexus makes planning effortless.
          </p>

        </div>

        <div className="features-grid">

          <FeatureCard
            icon="✦"
            title="AI-Powered Planning"
            text="Get intelligent travel plans based on your preferences, budget and interests."
          />

          <FeatureCard
            icon="🗺️"
            title="Smart Itineraries"
            text="Day-by-day plans designed to help you make the most of your journey."
          />

          <FeatureCard
            icon="💰"
            title="Budget Friendly"
            text="Understand exactly where your money goes with intelligent budget breakdowns."
          />

          <FeatureCard
            icon="❤️"
            title="Personalized Trips"
            text="Every itinerary is created around your unique travel style and interests."
          />

        </div>
      </section>

      {/* =================================================
          HOW IT WORKS
      ================================================= */}

      <section className="steps-section">

        <div className="section-heading center">

          <span className="section-label">
            HOW IT WORKS
          </span>

          <h2>
            Plan your perfect trip in 3 steps.
          </h2>

        </div>

        <div className="steps-grid">

          <Step
            number="01"
            title="Tell us your dream"
            text="Choose your destination, duration, budget and interests."
          />

          <Step
            number="02"
            title="Let AI plan it"
            text="Our AI creates a personalized itinerary in seconds."
          />

          <Step
            number="03"
            title="Pack & explore"
            text="Follow your plan and enjoy a stress-free adventure."
          />

        </div>

      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="cta-section">

        <div>

          <span className="section-label">
            YOUR NEXT ADVENTURE
          </span>

          <h2>
            Where will you go next?
          </h2>

          <p>
            Let TripNexus turn your travel idea
            into an unforgettable journey.
          </p>

          <button
            className="hero-button"
            onClick={() =>
              document
                .getElementById(
                  "planner"
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                })
            }
          >
            Start Planning
            <span>
              →
            </span>
          </button>

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="footer">

        <div className="footer-brand">

          <div className="nav-logo">

            <div className="logo-icon">
              ✈️
            </div>

            <span>
              TripNexus
            </span>

          </div>

          <p>
            AI-powered travel planning
            for modern explorers.
          </p>

        </div>

        <div className="footer-links">

          <a href="#home">
            Home
          </a>

          <a href="#explore">
            Explore
          </a>

          <a href="#planner">
            AI Planner
          </a>

          <a href="#features">
            Features
          </a>

          {user && (
            <button
              onClick={
                handleOpenMyTrips
              }
              className="footer-my-trips"
            >
              My Trips
            </button>
          )}

        </div>

        <div className="footer-copy">
          ©️ 2026 TripNexus. Built with AI & ❤️
        </div>

      </footer>

      {/* =================================================
          AUTH
      ================================================= */}

      {showAuth && (
        <Auth
          initialMode={
            authMode
          }
          onLogin={
            handleAuthSuccess
          }
          onClose={() =>
            setShowAuth(false)
          }
        />
      )}

    </div>
  );
}

/* =====================================================
   DESTINATION CARD
===================================================== */

function DestinationCard({
  name,
  subtitle,
  image,
  onClick,
}) {
  return (
    <button
      className="destination-card"
      onClick={onClick}
      type="button"
    >

      <img
        src={image}
        alt={`${name} travel destination`}
        loading="lazy"
      />

      <div className="destination-overlay">

        <div>

          <span className="destination-kicker">
            EXPLORE
          </span>

          <h3>
            {name}
          </h3>

          <p>
            {subtitle}
          </p>

        </div>

        <span className="card-arrow">
          →
        </span>

      </div>

    </button>
  );
}

/* =====================================================
   FEATURE CARD
===================================================== */

function FeatureCard({
  icon,
  title,
  text,
}) {
  return (
    <div className="feature-card">

      <div className="feature-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>
  );
}

/* =====================================================
   STEP
===================================================== */

function Step({
  number,
  title,
  text,
}) {
  return (
    <div className="step">

      <span className="step-number">
        {number}
      </span>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>
  );
}

/* =====================================================
   BUDGET ROW
===================================================== */

function BudgetRow({
  label,
  percentage,
}) {
  return (
    <div className="budget-row">

      <div className="budget-row-top">

        <span>
          {label}
        </span>

        <strong>
          {percentage}%
        </strong>

      </div>

      <div className="budget-progress">

        <div
          className="budget-progress-fill"
          style={{
            width:
              `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

/* =====================================================
   SAVED TRIP MODAL
===================================================== */

function SavedTripModal({
  trip,
  onClose,
}) {
  return (
    <div
      className="saved-modal-overlay"
    >

      <div
        className="saved-modal"
      >

        <div
          className="saved-modal-header"
        >

          <div>

            <span className="saved-modal-label">
              SAVED AI TRIP
            </span>

            <h2>
              {trip.destination}
            </h2>

            <p>
              {trip.days} days •{" "}
              {trip.travellers} travellers •{" "}
              {trip.travelStyle}
            </p>

          </div>

          <button
            onClick={onClose}
            className="modal-close"
          >
            ✕
          </button>

        </div>

        <div className="saved-info-grid">

          <div className="saved-info-card">

            <span>
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

          <div className="saved-info-card">

            <span>
              👥
            </span>

            <div>
              <small>
                Travellers
              </small>

              <strong>
                {trip.travellers}
              </strong>
            </div>

          </div>

          <div className="saved-info-card">

            <span>
              ✨
            </span>

            <div>
              <small>
                Interest
              </small>

              <strong>
                {trip.interest}
              </strong>
            </div>

          </div>

        </div>

        <div className="saved-modal-section">

          <h3>
            🗺️ Your Itinerary
          </h3>

          {trip.itinerary?.map(
            (item, index) => (
              <div
                key={index}
                className="saved-day"
              >

                <div className="saved-day-number">
                  {item.day}
                </div>

                <div>

                  <h4>
                    {item.title}
                  </h4>

                  <p>
                    {item.description}
                  </p>

                </div>

              </div>
            )
          )}

        </div>

        <div className="saved-modal-section">

          <h3>
            💰 Budget Breakdown
          </h3>

          <div className="saved-budget-list">

            {trip.budgetBreakdown?.map(
              (item, index) => (
                <div
                  key={index}
                  className="saved-budget-row"
                >

                  <span>
                    {item.label}
                  </span>

                  <strong>
                    {item.percentage}%
                  </strong>

                </div>
              )
            )}

          </div>

        </div>

        {trip.insights && (
          <div className="saved-insight">

            <strong>
              ✦ AI Insight
            </strong>

            <p>
              {trip.insights}
            </p>

          </div>
        )}

        <button
          onClick={onClose}
          className="modal-done-button"
        >
          Done
        </button>

      </div>
    </div>
  );
}

export default App;