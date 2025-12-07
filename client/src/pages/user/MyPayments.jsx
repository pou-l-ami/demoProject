import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/user-dashboard.css";
import "../../styles/admin-tables.css";

const MyPayments = () => {
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
        console.error("MyPayments error:", error);
        setErr(
          error.response?.data?.message ||
            "Failed to load payments. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const paidBookings = bookings.filter((b) => b.paymentStatus !== "unpaid");

  return (
    <section className="user-page">
      <div className="admin-card">
        <h2>My Payments</h2>
        <p className="subtitle">
          Payment information for your bookings (based on payment status).
        </p>

        {loading && <p className="info-text">Loading payments...</p>}
        {err && !loading && <p className="info-text error">{err}</p>}

        {!loading && !err && paidBookings.length === 0 && (
          <p className="info-text">No payments found yet.</p>
        )}

        {!loading && !err && paidBookings.length > 0 && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Venue</th>
                  <th>Amount (₹)</th>
                  <th>Payment Status</th>
                  <th>Event Date</th>
                </tr>
              </thead>
              <tbody>
                {paidBookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.eventName}</td>
                    <td>{b.venueName}</td>
                    <td>{b.totalAmount}</td>
                    <td>{b.paymentStatus}</td>
                    <td>{new Date(b.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyPayments;
