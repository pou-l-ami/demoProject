import React from "react";
// src/pages/admin/Report.jsx
import  { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin-tables.css";
import { BASE_URL } from "../../utils/config.js";

const Report = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/v1/booking`, {
          withCredentials: true,
        });
        setBookings(res.data.data || []);
      } catch (error) {
        console.error("Report error:", error);
        setErr(
          error.response?.data?.message ||
            "Failed to load report data. Make sure you are logged in as admin."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const total = bookings.length;
  const paid = bookings.filter((b) => b.paymentStatus === "paid").length;
  const revenue = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="admin-card">
      <h2>Reports</h2>
      <p className="subtitle">
        Quick business reports. You can later add export to PDF / Excel.
      </p>

      {loading && <p>Loading...</p>}
      {err && !loading && <p style={{ color: "#c62828" }}>{err}</p>}

      {!loading && !err && (
        <>
          <div className="dashboard-grid" style={{ marginBottom: "1rem" }}>
            <div className="stat-card">
              <span className="stat-label">Total Bookings</span>
              <span className="stat-value">{total}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Paid Bookings</span>
              <span className="stat-value">{paid}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Revenue (₹)</span>
              <span className="stat-value">{revenue}</span>
            </div>
          </div>

          <button
            onClick={() => alert("Later you can implement a real export.")}
          >
            Export Summary
          </button>
        </>
      )}
    </div>
  );
};

export default Report;

