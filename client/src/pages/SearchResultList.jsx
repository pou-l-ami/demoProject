import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/searchResults.css";

// Dummy data – you can later load this from backend
const venues = [
  {
    id: "v1",
    name: "Rose Garden Banquet",
    type: "Wedding",
    area: "Kolkata",
    capacity: 300,
    pricePerDay: "₹80,000 – ₹1,20,000",
    image:
      "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg",
    rentals: {
      decoration: ["Stage backdrop & entrance gate", "LED string lights", "Flower décor & pillars"],
      food: ["Full buffet setup", "Chafing dishes & warmers", "Serving counters"],
      kitchen: ["Gas stove & burners", "Cooking utensils & ladles", "Refrigerator / deep freezer"],
    },
  },
  {
    id: "v2",
    name: "City Party Hall",
    type: "Birthday Party",
    area: "Kolkata",
    capacity: 120,
    pricePerDay: "₹15,000 – ₹25,000",
    image:
      "https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg",
    rentals: {
      decoration: ["Balloon arch & backdrop", "Fairy lights", "Photo booth props"],
      food: ["Snacks counter", "Beverage station", "Cake table décor"],
      kitchen: ["Basic microwave & oven", "Plates & cutlery", "Water dispensers"],
    },
  },
  {
    id: "v3",
    name: "Business Conference Center",
    type: "Corporate Event",
    area: "Bengaluru",
    capacity: 250,
    pricePerDay: "₹60,000 – ₹90,000",
    image:
      "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg",
    rentals: {
      decoration: ["Podium backdrop", "Stage lighting", "Branding standees"],
      food: ["Hi-tea setup", "Buffet lunch", "Coffee station"],
      kitchen: ["Coffee machines", "Serve ware", "Chafing dishes"],
    },
  },
];

const SearchResultList = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const typeParam = query.get("type")?.toLowerCase() || "";
  const areaParam = query.get("area")?.toLowerCase() || "";
  const guestsParam = parseInt(query.get("guests") || "0", 10);

  const filteredVenues = venues.filter((v) => {
    const matchType = typeParam
      ? v.type.toLowerCase().includes(typeParam)
      : true;
    const matchArea = areaParam
      ? v.area.toLowerCase().includes(areaParam)
      : true;
    const matchGuest = guestsParam ? v.capacity >= guestsParam : true;

    return matchType && matchArea && matchGuest;
  });

  return (
    <section className="page search-page">
      <div className="page-inner">
        <div className="page-header">
          <h1>Available Venues & Rental Packages</h1>
          <p>
            Showing venues and rental options based on your search. You can rent
            decoration, catering and kitchen equipment together as a package.
          </p>
        </div>

        {filteredVenues.length === 0 ? (
          <p className="no-results">
            No matching venues found. Try changing event type, area or number of
            guests.
          </p>
        ) : (
          <div className="venue-grid">
            {filteredVenues.map((venue) => (
              <div key={venue.id} className="venue-card">
                {venue.image && (
                  <div className="venue-image-wrapper">
                    <img src={venue.image} alt={venue.name} />
                  </div>
                )}

                <div className="venue-content">
                  <h3>{venue.name}</h3>
                  <p className="venue-meta">
                    <span>{venue.type}</span> • <span>{venue.area}</span> •{" "}
                    <span>Capacity: {venue.capacity}</span>
                  </p>
                  <p className="venue-price">
                    Approx. rent per day: <strong>{venue.pricePerDay}</strong>
                  </p>

                  <div className="rental-sections">
                    <div>
                      <h4>Decoration on Rent</h4>
                      <ul>
                        {venue.rentals.decoration.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4>Food & Catering Setup</h4>
                      <ul>
                        {venue.rentals.food.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4>Kitchen Equipment</h4>
                      <ul>
                        {venue.rentals.kitchen.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="venue-actions">
                    <button className="primary-btn">
                      Rent Complete Event Setup
                    </button>
                    <button className="ghost-btn">
                      View Details / Customize
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchResultList;
