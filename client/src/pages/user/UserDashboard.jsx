import React from "react";
import { Link } from "react-router-dom";
import "../../styles/user-dashboard.css";

const UserDashboard = () => {
  let userName = "Guest";
  try {
    const raw = localStorage.getItem("auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.user?.username) userName = parsed.user.username;
    }
  } catch {}

  return (
    <section className="user-dash">
      <div className="user-card">
        <h2>Welcome, {userName} 👋</h2>
        <p>Manage your bookings and payments from one place.</p>

        <div className="user-links">
          <Link to="/user/bookings">My Bookings</Link>
          <Link to="/user/payments">My Payments</Link>
        </div>
      </div>
    </section>
  );
};

export default UserDashboard;

