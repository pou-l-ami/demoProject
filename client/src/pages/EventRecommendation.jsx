import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { 
  FiMapPin, 
  FiDollarSign, 
  FiUsers, 
  FiCalendar, 
  FiStar, 
  FiDownload, 
  FiAward, 
  FiPieChart, 
  FiRefreshCw, 
  FiTrendingUp, 
  FiCheckCircle, 
  FiInfo 
} from "react-icons/fi";
import "../styles/event-recommendation.css";

const eventTypesList = [
  { id: "Wedding", label: "Wedding", emoji: "💍" },
  { id: "Birthday Party", label: "Birthday Party", emoji: "🎂" },
  { id: "Corporate Event", label: "Corporate Event", emoji: "💼" },
  { id: "Engagement", label: "Engagement", emoji: "🤝" },
  { id: "College Fest", label: "College Fest", emoji: "🎓" }
];

const citiesList = ["Mumbai", "Delhi", "Bangalore", "Kolkata", "New York", "Chicago"];

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/product-images/banquet-chair.png";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/product-images")) {
    return `${BASE_URL}${imagePath}`;
  }
  // If it's a client public asset
  return imagePath;
};

const getAuthHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  try {
    const authData = localStorage.getItem("auth");
    if (authData) {
      const { token } = JSON.parse(authData);
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
  } catch (e) {
    console.error("Error setting authorization header:", e);
  }
  return headers;
};

const EventRecommendation = () => {
  const navigate = useNavigate();
  // Form State
  const [budget, setBudget] = useState(150000);
  const [eventType, setEventType] = useState("Wedding");
  const [guestCount, setGuestCount] = useState(150);
  const [location, setLocation] = useState("Mumbai");

  // System State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState("");

  const resultsRef = useRef(null);

  // Formats currency dynamically based on city (INR for Indian cities, USD for US cities)
  const isUSCity = ["New York", "Chicago"].includes(location);
  const currencySymbol = isUSCity ? "$" : "₹";
  
  const formatCost = (val) => {
    return isUSCity 
      ? `$${val.toLocaleString()}` 
      : `₹${val.toLocaleString()}`;
  };

  // Adjust default budget when city changes to represent realistic localized numbers
  useEffect(() => {
    if (isUSCity) {
      if (budget > 15000) {
        setBudget(8000); // lower localized number for USD
      }
    } else {
      if (budget < 10000) {
        setBudget(150000); // standard scale for INR
      }
    }
  }, [location]);

  // Loading Steps Simulator
  const loadingMessages = [
    "Loading event datasets and local venue CSV logs...",
    "Vectorizing query using Scikit-Learn TF-IDF extractor...",
    "Computing cosine similarity matches for event type & venues...",
    "Running multi-criteria budget & guest capacity ranking...",
    "Finalizing pricing projections and product rental catalogs..."
  ];

  const handleGetRecommendations = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep(0);
    setError("");
    setRecommendations(null);

    // Animate loader steps for premium user experience
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= 4) {
          clearInterval(interval);
          return 4;
        }
        return prev + 1;
      });
    }, 600);

    try {
      const response = await fetch(`${BASE_URL}/api/v1/recommendation`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          budget: Number(budget),
          eventType,
          guestCount: Number(guestCount),
          location
        })
      });

      const result = await response.json();

      // Wait a tiny bit to make the animation feel smooth
      setTimeout(() => {
        clearInterval(interval);
        setLoading(false);
        if (!response.ok || !result.success) {
          setError(result.message || "Failed to retrieve recommendations. Please check your backend connections.");
          Swal.fire({
            icon: "error",
            title: "Recommendation Failed",
            text: result.message || "Something went wrong. Please make sure the ML service is online.",
            confirmButtonColor: "#6366f1"
          });
        } else {
          setRecommendations(result.data);
          // Scroll to results cleanly
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }, 3000); // 3 seconds matches full loader sequence

    } catch (err) {
      clearInterval(interval);
      setLoading(false);
      setError("Unable to connect to the backend server. Please verify your Express service is running.");
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Could not connect to the backend API. Please make sure the backend Express server is running on port 8000.",
        confirmButtonColor: "#6366f1"
      });
    }
  };

  // Add Recommended Product to Cart
  const handleAddProductToCart = async (productId, productName) => {
    if (!productId) {
      Swal.fire({
        icon: "error",
        title: "Database Match Missing",
        text: "We couldn't resolve the database entry for this product yet. Make sure your database catalog is seeded.",
        confirmButtonColor: "#6366f1"
      });
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, qty: 1 }),
        credentials: "include"
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Swal.fire({
          icon: "success",
          title: "Added to Cart!",
          text: `${productName} has been added to your shopping cart successfully.`,
          showCancelButton: true,
          confirmButtonColor: "#6366f1",
          cancelButtonColor: "#10b981",
          confirmButtonText: "Go to Shopping Cart",
          cancelButtonText: "Keep Customizing"
        }).then((choice) => {
          if (choice.isConfirmed) {
            navigate("/buy-products");
          }
        });
      } else {
        if (response.status === 401) {
          Swal.fire({
            icon: "warning",
            title: "Authentication Required",
            text: "You must log in to manage your shopping cart.",
            showCancelButton: true,
            confirmButtonColor: "#6366f1",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Go to Login",
            cancelButtonText: "Cancel"
          }).then((choice) => {
            if (choice.isConfirmed) {
              navigate("/login");
            }
          });
        } else {
          throw new Error(result.message || "Failed to add product to cart");
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Cart Action Failed",
        text: err.message || "Could not complete add-to-cart request. Try again.",
        confirmButtonColor: "#6366f1"
      });
    }
  };

  // Book Curated Event recommendations in one click
  const handleBookEvent = async () => {
    if (!recommendations) return;
    const r = recommendations.recommendations;
    const p = recommendations.pricing;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/booking`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          eventName: `AI Curated ${eventType} in ${location}`,
          venueName: r.venue.venue_name,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
          guests: Number(guestCount),
          totalAmount: p.total_estimated_cost
        }),
        credentials: "include"
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Swal.fire({
          icon: "success",
          title: "AI Event Booked!",
          text: `Your curated reservation at ${r.venue.venue_name} has been created successfully. Proceed to payment in My Bookings to confirm!`,
          confirmButtonColor: "#6366f1",
          confirmButtonText: "Go to My Bookings"
        }).then(() => {
          navigate("/user/bookings");
        });
      } else {
        if (response.status === 401) {
          Swal.fire({
            icon: "warning",
            title: "Authentication Required",
            text: "You must be logged in to create event reservations.",
            showCancelButton: true,
            confirmButtonColor: "#6366f1",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Go to Login",
            cancelButtonText: "Cancel"
          }).then((choice) => {
            if (choice.isConfirmed) {
              navigate("/login");
            }
          });
        } else {
          throw new Error(result.message || "Failed to book event.");
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: err.message || "Could not reserve event. Make sure your server is online.",
        confirmButtonColor: "#6366f1"
      });
    }
  };

  // Browser PDF export using jsPDF
  const handleExportPDF = () => {
    if (!recommendations) return;

    try {
      const doc = new jsPDF();
      const r = recommendations.recommendations;
      const p = recommendations.pricing;

      // Color scheme tokens
      const primaryColor = [99, 102, 241];
      const textColor = [30, 41, 59];

      // Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 45, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("INTELLIGENT EVENT PLANNING PROPOSAL", 20, 20);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("AI-Powered Recommendations & Cost Allocation Analyst", 20, 30);

      // Section: Event Specifications
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("EVENT SPECIFICATIONS", 20, 60);
      doc.line(20, 63, 190, 63);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`• Event Type: ${recommendations.inputs.event_type}`, 20, 72);
      doc.text(`• Location: ${recommendations.inputs.city}`, 20, 80);
      doc.text(`• Expected Guests: ${recommendations.inputs.guest_count}`, 110, 72);
      doc.text(`• Projected Budget: ${formatCost(recommendations.inputs.budget)}`, 110, 80);

      // Section: Core Recommendations
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("RECOMMENDED SERVICES", 20, 95);
      doc.line(20, 98, 190, 98);

      // Venue
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`1. Top Recommended Venue: ${r.venue.venue_name}`, 20, 108);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`   Capacity: ${r.venue.capacity} guests | Rating: ${r.venue.rating} / 5.0 | Price Per Day: ${formatCost(p.venue_cost)}`, 20, 114);

      // Caterer
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`2. Selected Catering Vendor: ${r.caterer.service_name}`, 20, 126);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`   Category: Catering | Rating: ${r.caterer.rating} / 5.0 | Package Rate: ${formatCost(p.caterer_cost)}`, 20, 132);

      // Decorator
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`3. Selected Decoration Vendor: ${r.decorator.service_name}`, 20, 144);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`   Category: Decoration | Rating: ${r.decorator.rating} / 5.0 | Package Rate: ${formatCost(p.decorator_cost)}`, 20, 150);

      // Rental Products
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("RECOMMENDED RENTAL PRODUCTS", 20, 165);
      doc.line(20, 168, 190, 168);

      let yPos = 176;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      r.products.forEach((prod, index) => {
        doc.text(`${index + 1}. ${prod.product_name} (${prod.category}) — Rental Price: ${formatCost(prod.rental_price)} (Rating: ${prod.rating}/5)`, 25, yPos);
        yPos += 8;
      });

      // Section: Cost Allocation Analyst
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("AI BUDGET ANALYSIS & COST SUMMARY", 20, 205);
      doc.line(20, 208, 190, 208);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`- Venue Cost: ${formatCost(p.venue_cost)}`, 20, 218);
      doc.text(`- Catering Services Cost: ${formatCost(p.caterer_cost)}`, 20, 226);
      doc.text(`- Decoration Services Cost: ${formatCost(p.decorator_cost)}`, 20, 234);
      doc.text(`- Selected Rental Products Cost: ${formatCost(p.products_cost)}`, 20, 242);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Estimated Total Cost: ${formatCost(p.total_estimated_cost)}`, 110, 218);
      
      const isOver = p.total_estimated_cost > p.user_budget;
      if (isOver) {
        doc.setTextColor(239, 68, 68);
        doc.text(`Over Budget by: ${formatCost(p.total_estimated_cost - p.user_budget)}`, 110, 226);
      } else {
        doc.setTextColor(16, 185, 129);
        doc.text(`Projected Savings: ${formatCost(p.savings)}`, 110, 226);
      }
      
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Generated automatically by Antigravity Smart Event Recommendation Engine.", 20, 275);

      doc.save(`Event-AI-Proposal-${recommendations.inputs.event_type}.pdf`);
      
      Swal.fire({
        icon: "success",
        title: "Proposal Exported!",
        text: "Your AI-generated event budget proposal PDF was created successfully.",
        confirmButtonColor: "#6366f1"
      });
    } catch (pdfErr) {
      console.error("PDF generation failed:", pdfErr);
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Could not export PDF summary in your browser.",
        confirmButtonColor: "#6366f1"
      });
    }
  };

  return (
    <div className="recommendation-container">
      {/* HEADER HERO */}
      <div className="recommendation-header">
        <h1>Smart Event Recommendation</h1>
        <p>
          Leverage our advanced Scikit-Learn TF-IDF model and Pandas multi-criteria 
          ranking engine to instantly secure the best venue, catering, decoration, and products.
        </p>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="recommendation-layout">
        {/* LEFT FORM COLUMN */}
        <div className="input-glass-card">
          <h2>
            <FiPieChart style={{ color: "#6366f1" }} /> Configure Planner
          </h2>

          <form onSubmit={handleGetRecommendations}>
            {/* LOCATION SELECT */}
            <div className="form-group">
              <label>
                <FiMapPin /> Event Location
              </label>
              <select
                className="form-control-custom"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {citiesList.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* EVENT TYPE SELECTION */}
            <div className="form-group">
              <label>
                <FiCalendar /> Event Theme / Type
              </label>
              <div className="event-type-grid">
                {eventTypesList.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`event-type-btn ${eventType === t.id ? "active" : ""}`}
                    onClick={() => setEventType(t.id)}
                  >
                    <span style={{ fontSize: "1.2rem", display: "block" }}>
                      {t.emoji}
                    </span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* GUEST COUNT SLIDER */}
            <div className="form-group">
              <label>
                <FiUsers /> Expected Guests: <span>{guestCount} Guests</span>
              </label>
              <input
                type="range"
                className="slider-custom"
                min="20"
                max="500"
                step="10"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748b" }}>
                <span>20 Guests</span>
                <span>500 Guests</span>
              </div>
            </div>

            {/* BUDGET INPUT AND SLIDER */}
            <div className="form-group">
              <label>
                <FiDollarSign /> Overall Budget: <span>{formatCost(budget)}</span>
              </label>
              <input
                type="range"
                className="slider-custom"
                min={isUSCity ? 1000 : 25000}
                max={isUSCity ? 50000 : 1500000}
                step={isUSCity ? 500 : 25000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748b" }}>
                <span>{formatCost(isUSCity ? 1000 : 25000)}</span>
                <span>{formatCost(isUSCity ? 50000 : 1500000)}</span>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button type="submit" className="submit-btn-custom" disabled={loading}>
              {loading ? (
                <span>
                  <FiRefreshCw className="loader-spinner" style={{ animation: "spin 1s linear infinite", width: "16px", height: "16px", margin: "0 8px 0 0", verticalAlign: "middle" }} />
                  Processing Algorithms...
                </span>
              ) : (
                "Get Smart Matches"
              )}
            </button>
          </form>
        </div>

        {/* RIGHT DISPLAY PANEL COLUMN */}
        <div className="display-panel-wrapper">
          {/* STATE 1: INITIAL OR ERROR */}
          {!loading && !recommendations && !error && (
            <div className="empty-result-state">
              <div style={{ fontSize: "4.5rem" }}>🤖</div>
              <h3>AI Event Planner Awaiting</h3>
              <p>
                Configure your event city, theme type, expected guest sizes, and total financial 
                limits in the dashboard controls to trigger our Scikit-Learn based recommendation models.
              </p>
            </div>
          )}

          {/* STATE 2: LOADING SIMULATOR */}
          {loading && (
            <div className="loading-box">
              <div className="loader-spinner"></div>
              <h3>Calculating Smart Allocations</h3>
              <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "2rem" }}>
                Our Scikit-Learn TF-IDF model and decision trees are working on the datasets.
              </p>
              <div className="loading-steps">
                {loadingMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`loading-step-item ${
                      loadingStep === index ? "active" : loadingStep > index ? "done" : ""
                    }`}
                  >
                    {loadingStep > index ? (
                      <FiCheckCircle style={{ color: "#10b981", flexShrink: 0 }} />
                    ) : loadingStep === index ? (
                      <FiRefreshCw className="loader-spinner" style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite", color: "#6366f1", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: "14px", height: "14px", border: "2px solid #cbd5e1", borderRadius: "50%", flexShrink: 0 }} />
                    )}
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATE 3: RECOMMENDATION DASHBOARD */}
          {!loading && recommendations && (
            <div className="results-dashboard" ref={resultsRef}>
              
              {/* SECTION: TOP RECOMMENDATIONS */}
              <div className="section-title-wrapper">
                <h3>Top Service Matches</h3>
                <p>Specifically matched for {recommendations.inputs.event_type} in {recommendations.inputs.city}.</p>
              </div>

              <div className="cards-row">
                {/* VENUE CARD */}
                <div className="recommend-glass-card">
                  <div className="card-img-wrapper">
                    <img 
                      src={getImageUrl(recommendations.recommendations.venue.image)} 
                      alt={recommendations.recommendations.venue.venue_name}
                      onError={(e) => { e.target.src = "/event-images/event-img01.jpg"; }}
                    />
                    <div className="badge-tag venue-badge">BEST VENUE</div>
                    <div className="rating-badge">
                      <FiStar /> {recommendations.recommendations.venue.rating}
                    </div>
                  </div>
                  <div className="card-content-body">
                    <h4>{recommendations.recommendations.venue.venue_name}</h4>
                    <div className="card-desc-meta">
                      <span><FiMapPin /> {recommendations.recommendations.venue.city}</span>
                      <span><FiUsers /> Max Capacity: {recommendations.recommendations.venue.capacity} Guests</span>
                    </div>
                    <div className="card-pricing-footer">
                      <span className="label">Price / Day:</span>
                      <span className="price">{formatCost(recommendations.pricing.venue_cost)}</span>
                    </div>
                  </div>
                </div>

                {/* CATERING CARD */}
                <div className="recommend-glass-card">
                  <div className="card-img-wrapper">
                    <img 
                      src={getImageUrl(recommendations.recommendations.caterer.image)} 
                      alt={recommendations.recommendations.caterer.service_name}
                      onError={(e) => { e.target.src = "/event-images/event-img02.jpg"; }}
                    />
                    <div className="badge-tag catering-badge">BEST CATERER</div>
                    <div className="rating-badge">
                      <FiStar /> {recommendations.recommendations.caterer.rating}
                    </div>
                  </div>
                  <div className="card-content-body">
                    <h4>{recommendations.recommendations.caterer.service_name}</h4>
                    <div className="card-desc-meta">
                      <span><FiMapPin /> {recommendations.recommendations.caterer.city}</span>
                      <span><FiAward /> Service: Catering Package</span>
                    </div>
                    <div className="card-pricing-footer">
                      <span className="label">Package Price:</span>
                      <span className="price">{formatCost(recommendations.pricing.caterer_cost)}</span>
                    </div>
                  </div>
                </div>

                {/* DECORATION CARD */}
                <div className="recommend-glass-card">
                  <div className="card-img-wrapper">
                    <img 
                      src={getImageUrl(recommendations.recommendations.decorator.image)} 
                      alt={recommendations.recommendations.decorator.service_name}
                      onError={(e) => { e.target.src = "/event-images/event-img03.jpg"; }}
                    />
                    <div className="badge-tag decorator-badge">BEST DECORATOR</div>
                    <div className="rating-badge">
                      <FiStar /> {recommendations.recommendations.decorator.rating}
                    </div>
                  </div>
                  <div className="card-content-body">
                    <h4>{recommendations.recommendations.decorator.service_name}</h4>
                    <div className="card-desc-meta">
                      <span><FiMapPin /> {recommendations.recommendations.decorator.city}</span>
                      <span><FiAward /> Service: Decoration Design</span>
                    </div>
                    <div className="card-pricing-footer">
                      <span className="label">Package Price:</span>
                      <span className="price">{formatCost(recommendations.pricing.decorator_cost)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: RECOMMEND PRODUCTS */}
              <div className="products-section-container">
                <div className="section-title-wrapper" style={{ marginBottom: "1.2rem" }}>
                  <h3>Recommended Rental Products</h3>
                  <p>Enhance your event experience with these top-rated utility items available in your location.</p>
                </div>

                <div className="products-grid-custom">
                  {recommendations.recommendations.products.map((prod, idx) => (
                    <div className="recommend-glass-card" key={idx}>
                      <div className="card-img-wrapper" style={{ height: "130px" }}>
                        <img 
                          src={getImageUrl(prod.image)} 
                          alt={prod.product_name}
                          onError={(e) => { e.target.src = "/product-images/banquet-chair.png"; }}
                        />
                        <div className="rating-badge">
                          <FiStar /> {prod.rating}
                        </div>
                      </div>
                      <div className="card-content-body" style={{ padding: "0.9rem" }}>
                        <h4 style={{ fontSize: "0.95rem", marginBottom: "0.2rem" }}>{prod.product_name}</h4>
                        <div className="card-desc-meta" style={{ marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.75rem" }}><FiInfo /> Category: {prod.category}</span>
                        </div>
                        <div className="card-pricing-footer" style={{ paddingTop: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                          <div>
                            <span className="label" style={{ fontSize: "0.7rem", display: "block" }}>Rental:</span>
                            <span className="price" style={{ fontSize: "1.05rem" }}>{formatCost(prod.rental_price)}</span>
                          </div>
                          <button
                            type="button"
                            className="btn primary__btn btn-sm"
                            style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", borderRadius: "10px" }}
                            onClick={() => handleAddProductToCart(prod._id, prod.product_name)}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: BUDGET ANALYST DASHBOARD */}
              <div className="budget-dashboard-card">
                
                {/* Detailed Summary */}
                <div className="pricing-summary-column">
                  <h3>
                    <FiTrendingUp style={{ color: "#34d399" }} /> Cost Breakdown
                  </h3>
                  
                  <div className="cost-row">
                    <span className="cost-label">Venue Rental Cost:</span>
                    <span className="cost-value">{formatCost(recommendations.pricing.venue_cost)}</span>
                  </div>

                  <div className="cost-row">
                    <span className="cost-label">Catering Package Cost:</span>
                    <span className="cost-value">{formatCost(recommendations.pricing.caterer_cost)}</span>
                  </div>

                  <div className="cost-row">
                    <span className="cost-label">Decoration Package Cost:</span>
                    <span className="cost-value">{formatCost(recommendations.pricing.decorator_cost)}</span>
                  </div>

                  <div className="cost-row">
                    <span className="cost-label">Product Rental Cost:</span>
                    <span className="cost-value">{formatCost(recommendations.pricing.products_cost)}</span>
                  </div>

                  <div className="cost-row total-cost-row">
                    <span className="cost-label">Estimated Total:</span>
                    <span className="cost-value">{formatCost(recommendations.pricing.total_estimated_cost)}</span>
                  </div>
                </div>

                {/* Analytical Visualizer */}
                <div className="budget-visual-column">
                  <span className="visual-title">Financial Health Status</span>
                  
                  <div className="budget-bar-track">
                    <div 
                      className={`budget-bar-fill ${
                        recommendations.pricing.percentage_spent > 100 
                          ? "danger" 
                          : recommendations.pricing.percentage_spent > 85 
                          ? "warning" 
                          : ""
                      }`}
                      style={{ width: `${Math.min(100, recommendations.pricing.percentage_spent)}%` }}
                    />
                  </div>

                  <div className="visual-stats-row">
                    <span>Budget Spent: <strong>{recommendations.pricing.percentage_spent}%</strong></span>
                    <span>Limit: <strong>{formatCost(recommendations.pricing.user_budget)}</strong></span>
                  </div>

                  {recommendations.pricing.total_estimated_cost > recommendations.pricing.user_budget ? (
                    <div className="savings-badge-card danger">
                      <FiInfo style={{ flexShrink: 0 }} />
                      <span>
                        Over Budget by {formatCost(recommendations.pricing.total_estimated_cost - recommendations.pricing.user_budget)}! Consider reducing guest count or adjusting options.
                      </span>
                    </div>
                  ) : (
                    <div className="savings-badge-card">
                      <FiCheckCircle style={{ flexShrink: 0 }} />
                      <span>
                        Under Budget! You are saving {formatCost(recommendations.pricing.savings)}.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS PANEL */}
              <div className="action-box" style={{ flexWrap: "wrap", gap: "1rem" }}>
                <button 
                  type="button" 
                  className="action-btn secondary"
                  onClick={() => {
                    setRecommendations(null);
                    setError("");
                  }}
                >
                  <FiRefreshCw /> Reset
                </button>
                
                <button 
                  type="button" 
                  className="action-btn primary"
                  onClick={handleBookEvent}
                  style={{ background: "#10b981", boxShadow: "0 6px 15px rgba(16, 185, 129, 0.2)" }}
                >
                  <FiCheckCircle /> Book Curated Event
                </button>

                <button 
                  type="button" 
                  className="action-btn primary"
                  onClick={handleExportPDF}
                >
                  <FiDownload /> Export Proposal PDF
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRecommendation;
