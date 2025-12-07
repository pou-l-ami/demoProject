// src/pages/admin/Notifications.jsx
import React from "react";
import "../../styles/admin-tables.css";

const mockNotifications = [
  {
    id: 1,
    type: "booking",
    message: "New booking created for Wedding Reception on 25 Jul 2025.",
    createdAt: "2025-07-01 10:30",
  },
  {
    id: 2,
    type: "payment",
    message: "Payment received for Corporate Meet – ₹40,000.",
    createdAt: "2025-07-02 14:15",
  },
  {
    id: 3,
    type: "stock",
    message: "Stock of Stage Lights is low (2 remaining).",
    createdAt: "2025-07-03 09:00",
  },
];

const Notifications = () => {
  return (
    <div className="admin-card">
      <h2>Notifications</h2>
      <p className="subtitle">
        Recent alerts and system messages for your events business.
      </p>

      <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem" }}>
        {mockNotifications.map((n) => (
          <li
            key={n.id}
            style={{
              padding: "0.7rem 0",
              borderBottom: "1px solid #f1d1dd",
            }}
          >
            <div style={{ fontSize: "0.88rem", marginBottom: "0.1rem" }}>
              {n.message}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#999" }}>
              {n.createdAt} · {n.type}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;

