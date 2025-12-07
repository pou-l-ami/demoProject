import React from "react";
import "../../styles/admin-tables.css";

const Welcome = () => {
  return (
    <div className="admin-card">
      <h2>Welcome, Admin 👋</h2>
      <p className="subtitle">
        Use the left menu to manage bookings, payments, rental stock and reports.
      </p>

      <p style={{ fontSize: "0.95rem", color: "#555" }}>
        This panel is only accessible to users with the <strong>admin</strong> role.
        You can create admin users directly from MongoDB or through a separate
        "create admin" function in your backend.
      </p>
    </div>
  );
};

export default Welcome;
