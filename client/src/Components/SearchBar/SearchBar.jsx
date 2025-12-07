/*import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/searchbar.css"; // keep or change to your css file

const SearchBar = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    type: "",
    area: "",
    guests: "",
  });

  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.area) params.set("area", filters.area);
    if (filters.guests) params.set("guests", filters.guests);

    navigate(`/events/search?${params.toString()}`);
  };

  return (
    <section className="searchbar-section">
      <div className="searchbar-inner">
        <h2 className="searchbar-title">
          Are you looking for a perfect venue near you to organize an event? We
          got you.
        </h2>

        <form className="searchbar-form" onSubmit={handleSubmit}>
          <div className="search-input">
            <input
              type="text"
              name="type"
              placeholder="Event Type (Wedding, Birthday...)"
              value={filters.type}
              onChange={handleChange}
            />
          </div>

          <div className="search-input">
            <input
              type="text"
              name="area"
              placeholder="Area / City"
              value={filters.area}
              onChange={handleChange}
            />
          </div>

          <div className="search-input">
            <input
              type="number"
              name="guests"
              placeholder="Max Guests"
              min="1"
              value={filters.guests}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="search-btn">
            Search Event
          </button>
        </form>
      </div>
    </section>
  );
};

export default SearchBar; */
