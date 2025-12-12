import React from "react";
import "../styles/about.css";
// src/pages/About.jsx


const About = () => {
  return (
    <section className="about-section">
      <div className="about-container">
        <header className="about-header">
          <p className="about-badge">About Events App</p>
          <h2 className="about-title">
            Discover, Book & <span>Celebrate</span>
          </h2>
          <p className="about-subtitle">
            Events App helps you discover curated events, manage your bookings
            and stay updated about everything happening around you.
          </p>
        </header>

        <div className="about-grid">
          <article className="about-card">
            <h3>Our Mission</h3>
            <p>
              To make event discovery simple, delightful and accessible. From
              concerts to conferences, we bring everything into one beautiful
              experience.
            </p>
          </article>

          <article className="about-card">
            <h3>Why Choose Us</h3>
            <p>
              Clean design, smooth booking flow and instant notifications. We
              focus on what matters most – your time and your experience.
            </p>
          </article>

          <article className="about-card">
            <h3>For Organisers</h3>
            <p>
              Create events, manage attendees and track bookings from a single
              dashboard. We help you grow your community with ease.
            </p>
          </article>
        </div>

        <div className="about-stats">
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Events Planned</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4.9★</span>
            <span className="stat-label">Client Rating</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Trusted Partners</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
