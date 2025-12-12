// // client/src/pages/user/UserDashboard.jsx
// // client/src/pages/user/UserDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../../styles/user-dashboard.css";

const UserDashboard = () => {
  return (
    <section className="user-dashboard">
      <div className="dashboard-container">
        
        <h2>Welcome </h2>
        <p className="dashboard-subtitle">
          Manage your bookings, payments and cart activity.
        </p>

        <div className="dashboard-cards">
          <Link to="/user/bookings" className="dash-card">
            <h3>My Bookings</h3>
            <p>View and manage event bookings</p>
          </Link>

          <Link to="/user/payments" className="dash-card">
            <h3>My Payments</h3>
            <p>Invoices & transaction details</p>
          </Link>

          <Link to="/buy-products" className="dash-card">
            <h3>Buy / Rent Products</h3>
            <p>Checkout and track product orders</p>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default UserDashboard;

