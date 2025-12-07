import React from "react";
import "../styles/eventDetails.css";

const EventDetails = () => {
  // Later you can use useParams() to load real data by ID
  return (
    <section className="page event-details-page">
      <div className="page-inner">
        <div className="page-header">
          <h1>Event Details</h1>
          <p>
            Here you can show complete information of a selected event – agenda,
            speakers, tickets and more.
          </p>
        </div>

        <div className="event-details-card">
          <h2>Sample Event Title</h2>
          <p className="details-meta">
            <span>Date: 25 July 2025</span>
            <span>Location: Kolkata</span>
          </p>

          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iure,
            aliquid. Accusantium delectus voluptate dolores quaerat, expedita
            eveniet eum fugiat cupiditate.
          </p>

          <ul className="details-list">
            <li>✔ Easy online booking</li>
            <li>✔ Instant confirmation email</li>
            <li>✔ Support for group bookings</li>
          </ul>

          <button className="event-btn">Book Tickets</button>
        </div>
      </div>
    </section>
  );
};

export default EventDetails;
