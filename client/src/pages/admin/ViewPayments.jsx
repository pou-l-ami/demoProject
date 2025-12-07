// src/pages/admin/ViewPayments.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin-tables.css";

const ViewPayments = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/api/v1/booking", {
          withCredentials: true,
        });

        const bookings = res.data.data || [];
        const paidRelated = bookings.filter(
          (b) => b.paymentStatus && b.paymentStatus !== "unpaid"
        );
        setRows(paidRelated);
      } catch (error) {
        console.error("ViewPayments error:", error);
        setErr(
          error.response?.data?.message ||
            "Failed to load payments. Make sure you are logged in as admin."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const totalPaid = rows
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="admin-card">
      <h2>Payments</h2>
      <p className="subtitle">
        Payment information for each booking (built from booking data).
      </p>

      {loading && <p>Loading...</p>}
      {err && !loading && <p style={{ color: "#c62828" }}>{err}</p>}

      {!loading && !err && (
        <div className="dashboard-grid" style={{ marginBottom: "1rem" }}>
          <div className="stat-card">
            <span className="stat-label">Payment Records</span>
            <span className="stat-value">{rows.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Fully Paid (₹)</span>
            <span className="stat-value">{totalPaid}</span>
          </div>
        </div>
      )}

      {!loading && !err && rows.length === 0 && (
        <p>No payments found yet.</p>
      )}

      {!loading && !err && rows.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Event</th>
                <th>Venue</th>
                <th>Amount (₹)</th>
                <th>Payment Status</th>
                <th>Event Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b._id}>
                  <td>{b.user?.email || "N/A"}</td>
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
  );
};

export default ViewPayments;

