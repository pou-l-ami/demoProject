import React from "react";
import "../styles/team.css";

const teamMembers = [
  {
    name: "Evenza",
    role: "Founder & Lead Planner",
    bio: "Passionate about creating memorable experiences and flawless events.",
  },
  // {
  //   name: "Poulami Acharya",
  //   role: "Full-Stack Developer",
  //   bio: "Builds and maintains the event booking platform and integrations.",
  // },
  // {
  //   name: "",
  //   role: "Creative Designer",
  //   bio: "Designs branding, visuals and themes for all our events.",
  // },
];

const Team = () => {
  return (
    <section className="page team-page">
      <div className="page-inner">
        <div className="page-header">
          <h1>Our Team</h1>
          <p>
            Meet the people who work behind the scenes to make every event
            special.
          </p>
        </div>

        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <div className="avatar-placeholder">
                {member.name.charAt(0)}
              </div>
              <h3>{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-bio">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;

