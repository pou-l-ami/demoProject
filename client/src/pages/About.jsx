import React from "react";
import "../styles/about.css";

const About = () => {
  return (
    <section className="page about-page">
      <div className="page-inner">
        <div className="page-header">
          <h1>About Events App</h1>
          <p>
            Events App helps you discover curated events, manage your bookings
            and stay updated about everything happening around you.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <h3>Our Mission</h3>
            <p>
              To make event discovery simple, delightful and accessible. From
              concerts to conferences, we bring everything into one beautiful
              experience.
            </p>
          </div>

          <div className="about-card">
            <h3>Why Choose Us</h3>
            <p>
              Clean design, smooth booking flow and instant notifications. We
              focus on what matters most – your time and experience.
            </p>
          </div>

          <div className="about-card">
            <h3>For Organisers</h3>
            <p>
              Create events, manage attendees and track bookings from a single
              dashboard. We help you grow your community with ease.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
