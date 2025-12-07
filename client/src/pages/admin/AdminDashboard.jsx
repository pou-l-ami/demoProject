// src/pages/admin/AdminDashboard.jsx
// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiDollarSign,
} from "react-icons/fi";
import "../../styles/admin-dashboard.css";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/api/v1/booking", {
          withCredentials: true,
        });
        setBookings(res.data.data || []);
      } catch (error) {
        console.error("AdminDashboard error:", error);
        setErr(
          error.response?.data?.message ||
            "Failed to load dashboard data. Make sure you are logged in as admin."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const totalBookings = bookings.length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const revenue = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const latest = bookings.slice(0, 5);

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>High level overview of events, bookings and revenue.</p>
        </div>
      </header>

      {loading && <p className="ad-info">Loading dashboard...</p>}
      {err && !loading && <p className="ad-info ad-error">{err}</p>}

      {!loading && !err && (
        <>
          {/* KPI CARDS */}
          <section className="kpi-grid">
            <div className="kpi-card kpi-primary">
              <div className="kpi-top">
                <span className="kpi-label">Total Bookings</span>
                <span className="kpi-icon">
                  <FiCalendar />
                </span>
              </div>
              <p className="kpi-value">{totalBookings}</p>
              <p className="kpi-sub">
                All bookings in the system across all events.
              </p>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-label">Confirmed</span>
                <span className="kpi-icon green">
                  <FiCheckCircle />
                </span>
              </div>
              <p className="kpi-value">{confirmed}</p>
              <p className="kpi-sub">Approved and ready to execute.</p>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-label">Pending</span>
                <span className="kpi-icon orange">
                  <FiClock />
                </span>
              </div>
              <p className="kpi-value">{pending}</p>
              <p className="kpi-sub">Awaiting confirmation or payment.</p>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-label">Cancelled</span>
                <span className="kpi-icon red">
                  <FiXCircle />
                </span>
              </div>
              <p className="kpi-value">{cancelled}</p>
              <p className="kpi-sub">Bookings that won’t go ahead.</p>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-label">Paid Revenue</span>
                <span className="kpi-icon teal">
                  <FiDollarSign />
                </span>
              </div>
              <p className="kpi-value">₹{revenue}</p>
              <p className="kpi-sub">Total amount fully received.</p>
            </div>
          </section>

          {/* BOTTOM SECTION */}
          <section className="dashboard-bottom">
            <div className="admin-card panel">
              <h2>Latest Bookings</h2>
              {latest.length === 0 ? (
                <p className="ad-info">No bookings yet.</p>
              ) : (
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Guests</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latest.map((b) => (
                      <tr key={b._id}>
                        <td>{b.eventName}</td>
                        <td>{b.user?.email || "N/A"}</td>
                        <td>
                          {b.date ? new Date(b.date).toLocaleDateString() : "-"}
                        </td>
                        <td>{b.guests}</td>
                        <td>
                          <span className={`status-pill ${b.status}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="admin-card panel side">
              <h2>Status Summary</h2>
              <ul className="status-list">
                <li>
                  <span className="dot confirmed" />
                  Confirmed
                  <span className="status-count">{confirmed}</span>
                </li>
                <li>
                  <span className="dot pending" />
                  Pending
                  <span className="status-count">{pending}</span>
                </li>
                <li>
                  <span className="dot cancelled" />
                  Cancelled
                  <span className="status-count">{cancelled}</span>
                </li>
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
