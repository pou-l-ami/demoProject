import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/user-dashboard.css";
import "../../styles/admin-tables.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:8000/api/v1/booking/my-bookings",
          { withCredentials: true }
        );
        setBookings(res.data.data || []);
      } catch (error) {
        console.error("MyBookings error:", error);
        setErr(
          error.response?.data?.message ||
            "Failed to load bookings. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <section className="user-page">
      <div className="admin-card">
        <h2>My Bookings</h2>
        <p className="subtitle">
          All event bookings you have created in the system.
        </p>

        {loading && <p className="info-text">Loading bookings...</p>}
        {err && !loading && <p className="info-text error">{err}</p>}

        {!loading && !err && bookings.length === 0 && (
          <p className="info-text">
            You don't have any bookings yet. Go to Events and create one.
          </p>
        )}

        {!loading && !err && bookings.length > 0 && (
          <>
            {/* Top summary cards */}
            <div className="dashboard-grid" style={{ marginBottom: "1.2rem" }}>
              <div className="stat-card">
                <span className="stat-label">Total Bookings</span>
                <span className="stat-value">{bookings.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Confirmed</span>
                <span className="stat-value">
                  {bookings.filter((b) => b.status === "confirmed").length}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Pending</span>
                <span className="stat-value">
                  {bookings.filter((b) => b.status === "pending").length}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Venue</th>
                    <th>Date</th>
                    <th>Guests</th>
                    <th>Amount (₹)</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td>{b.eventName}</td>
                      <td>{b.venueName}</td>
                      <td>{new Date(b.date).toLocaleDateString()}</td>
                      <td>{b.guests}</td>
                      <td>{b.totalAmount}</td>
                      <td>
                        <span className={`status-pill ${b.status}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>{b.paymentStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default MyBookings;

