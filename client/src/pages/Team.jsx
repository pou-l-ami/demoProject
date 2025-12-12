// src/pages/Team.jsx  (or wherever your Team page lives)
import React from "react";
import "../styles/team.css";

const teamMembers = [
  {
    name: "Evenza",
    role: "Founder & Lead Planner",
    tagline:
      "Passionate about creating memorable experiences and flawless events.",
    initial: "E",
  },
  // you can add more members here later
];

const Team = () => {
  return (
    <section className="team-section">
      <div className="team-container">
        <div className="team-header">
          <p className="team-badge">Our Team</p>
          <h2 className="team-title">
            The People Behind Your <span>Perfect Events</span>
          </h2>
          <p className="team-subtitle">
            Meet the faces who plan, design and manage unforgettable
            celebrations for you.
          </p>
        </div>

        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <article className="team-card" key={index}>
              <div className="team-avatar-wrapper">
                <div className="team-avatar">{member.initial}</div>
                <div className="avatar-glow"></div>
              </div>

              <h3 className="member-name">{member.name}</h3>
              <p className="member-role">{member.role}</p>
              <p className="member-tagline">{member.tagline}</p>

              <div className="member-meta">
                <span className="member-pill">Event Strategy</span>
                <span className="member-pill">Client Experience</span>
                <span className="member-pill">Design</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
