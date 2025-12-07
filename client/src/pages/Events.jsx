import React, { useState } from "react";
import "../styles/events.css";

const eventTypes = [
  "Wedding",
  "Birthday Party",
  "Corporate Event",
  "Engagement",
  "College Fest",
];

const Events = () => {
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState("medium"); // low | medium | high
  const [guests, setGuests] = useState(100);
  const [eventType, setEventType] = useState("Wedding");

  // ---------- SUGGESTION HELPERS ----------

  const getLocationSuggestion = () => {
    if (eventType === "Wedding") {
      if (budget === "high") {
        return "5★ banquet hall with lawn, within 5–8 km of city center.";
      }
      if (budget === "low") {
        return "Community hall or small marriage hall near your locality.";
      }
      return "3★ hotel banquet / mid-range marriage hall nearby.";
    }

    if (eventType === "Corporate Event") {
      return "Business hotel conference hall with projector and Wi-Fi.";
    }

    if (eventType === "Birthday Party") {
      return "Indoor party hall / rooftop café with decoration support.";
    }

    if (eventType === "College Fest") {
      return "College ground / auditorium with stage and sound system.";
    }

    return "Indoor hall or open-air venue suitable for your guest count.";
  };

  const getDecorationIdeas = () => {
    const base = [
      "Stage backdrop with theme colors",
      "Entrance gate arch",
      "Photo booth corner for guests",
    ];

    if (budget === "high") {
      return [
        ...base,
        "Fairy lights & LED string lights",
        "Flower ceiling décor & chandeliers",
        "Premium seating with covers & ribbons",
      ];
    }

    if (budget === "low") {
      return [
        ...base,
        "Minimal flower décor",
        "Paper lanterns or balloons",
        "Simple seating with cloth drapes",
      ];
    }

    return [
      ...base,
      "LED par can lights for stage",
      "Mix of real & artificial flowers",
      "Theme-based welcome board",
    ];
  };

  const getFoodMenu = () => {
    if (budget === "high") {
      return {
        style: "Buffet with live counters",
        items: [
          "Welcome drink & mocktails",
          "2–3 starters (veg & non-veg)",
          "3–4 main course items",
          "Assorted breads & rice",
          "2 desserts + ice-cream",
        ],
      };
    }

    if (budget === "low") {
      return {
        style: "Fixed plate / simple buffet",
        items: [
          "Welcome drink",
          "1 starter",
          "2 main course items",
          "Roti / rice",
          "1 dessert",
        ],
      };
    }

    return {
      style: "Standard buffet",
      items: [
        "Welcome drink",
        "2 starters",
        "3 main course items",
        "Breads & rice",
        "1–2 desserts",
      ],
    };
  };

  const getProductSuggestions = () => {
    const decorationProducts = [
      "LED string lights & spot lights",
      "Flower bunches / garlands",
      "Decorative pillars & stands",
      "Stage backdrop frames",
      "Fabric drapes & decorative cloths",
    ];

    const foodProducts = [
      "Chafing dishes & serving bowls",
      "Gas stove / induction & burners",
      "Cooking utensils & ladles",
      "Disposable plates / cups / cutlery",
      "Water dispensers & serving jugs",
    ];

    const kitchenExtras = [
      "Basic ingredients (oil, spices, rice, flour, etc.)",
      "Serving trolleys or tables",
      "Coolers / refrigerators for drinks & desserts",
    ];

    return { decorationProducts, foodProducts, kitchenExtras };
  };

  const { decorationProducts, foodProducts, kitchenExtras } =
    getProductSuggestions();
  const foodMenu = getFoodMenu();

  // ---------- HANDLERS ----------

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <section className="planner-section">
      <div className="planner-inner">
        {/* STEPPER */}
        <div className="planner-steps">
          <div className={`step ${step >= 1 ? "active" : ""}`}>
            <span>1</span> Budget & Guests
          </div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            <span>2</span> Event Type
          </div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>
            <span>3</span> Suggestions
          </div>
        </div>

        <div className="planner-layout">
          {/* LEFT: FORM */}
          <div className="planner-form-card">
            {step === 1 && (
              <>
                <h2>Select Budget & Approximate Guests</h2>
                <p className="planner-subtext">
                  Start by choosing your budget range and expected guest count.
                </p>

                <div className="budget-grid">
                  <button
                    type="button"
                    className={`budget-card ${
                      budget === "low" ? "selected" : ""
                    }`}
                    onClick={() => setBudget("low")}
                  >
                    <h4>Low Budget</h4>
                    <p>₹ — Suitable for small/simple events.</p>
                  </button>
                  <button
                    type="button"
                    className={`budget-card ${
                      budget === "medium" ? "selected" : ""
                    }`}
                    onClick={() => setBudget("medium")}
                  >
                    <h4>Medium Budget</h4>
                    <p>₹₹ — Balanced décor & food options.</p>
                  </button>
                  <button
                    type="button"
                    className={`budget-card ${
                      budget === "high" ? "selected" : ""
                    }`}
                    onClick={() => setBudget("high")}
                  >
                    <h4>High Budget</h4>
                    <p>₹₹₹ — Premium venues & services.</p>
                  </button>
                </div>

                <div className="form-row">
                  <label htmlFor="guests">
                    Approximate number of guests:{" "}
                    <strong>{guests}</strong>
                  </label>
                  <input
                    type="range"
                    id="guests"
                    min="20"
                    max="500"
                    step="10"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                  />
                  <div className="range-labels">
                    <span>20</span>
                    <span>500</span>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2>Choose Type of Event</h2>
                <p className="planner-subtext">
                  We will recommend venue, decoration and food based on your
                  event type.
                </p>

                <div className="type-grid">
                  {eventTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`type-card ${
                        eventType === type ? "selected" : ""
                      }`}
                      onClick={() => setEventType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2>Summary of Your Plan</h2>
                <p className="planner-subtext">
                  Based on your inputs, here is the recommended event plan.
                </p>

                <div className="summary-box">
                  <p>
                    <strong>Budget:</strong>{" "}
                    {budget === "low"
                      ? "Low"
                      : budget === "medium"
                      ? "Medium"
                      : "High"}{" "}
                    &nbsp;•&nbsp; <strong>Guests:</strong> {guests}
                  </p>
                  <p>
                    <strong>Event Type:</strong> {eventType}
                  </p>
                </div>
              </>
            )}

            <div className="planner-actions">
              {step > 1 && (
                <button type="button" className="ghost-btn" onClick={prevStep}>
                  Back
                </button>
              )}
              {step < 3 && (
                <button type="button" className="primary-btn" onClick={nextStep}>
                  Next
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: SUGGESTIONS */}
          <div className="planner-suggestions">
            <div className="suggestion-card">
              <h3>Recommended Location</h3>
              <p>{getLocationSuggestion()}</p>
              <p className="tiny-note">
                Tip: search halls within 5–8 km to reduce travel time for{" "}
                {guests} guests.
              </p>
            </div>

            <div className="suggestion-card">
              <h3>Decoration Ideas</h3>
              <ul>
                {getDecorationIdeas().map((idea, idx) => (
                  <li key={idx}>{idea}</li>
                ))}
              </ul>
            </div>

            <div className="suggestion-card">
              <h3>Food Menu & Catering Style</h3>
              <p>
                <strong>Service:</strong> {foodMenu.style}
              </p>
              <ul>
                {foodMenu.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="suggestion-card">
              <h3>Products to Buy / Rent</h3>

              <div className="products-grid">
                <div>
                  <h4>Decoration Products</h4>
                  <ul>
                    {decorationProducts.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4>Food & Catering</h4>
                  <ul>
                    {foodProducts.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4>Kitchen Essentials</h4>
                  <ul>
                    {kitchenExtras.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="tiny-note">
                You can choose to rent larger items (lights, pillars, kitchen
                equipment) and buy consumables (flowers, ingredients, disposables).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Events;
