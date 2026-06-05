// src/pages/admin/ViewBookings.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin-tables.css";
import { BASE_URL } from "../../utils/config.js";

const statusOptions = ["pending", "confirmed", "cancelled"];
const paymentOptions = ["unpaid", "partial", "paid"];

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [savingId, setSavingId] = useState(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/v1/booking`, {
        withCredentials: true,
      });
      setBookings(res.data.data || []);
    } catch (error) {
      console.error("ViewBookings error:", error);
      setErr(
        error.response?.data?.message ||
          "Failed to load bookings. Make sure you are logged in as admin."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleChange = (id, field, value) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleSave = async (booking) => {
    try {
      setSavingId(booking._id);
      await axios.put(
        `${BASE_URL}/api/v1/booking/${booking._id}`,
        {
          status: booking.status,
          paymentStatus: booking.paymentStatus,
        },
        { withCredentials: true }
      );
      await loadBookings();
    } catch (error) {
      console.error("Update booking error:", error);
      alert(
        error.response?.data?.message || "Failed to update booking. Try again."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-card admin-animate">
        <h2>Bookings</h2>
        <p className="subtitle">
          All bookings in the system. Update status and payment here.
        </p>

        {loading && <p>Loading...</p>}
        {err && !loading && <p style={{ color: "#c62828" }}>{err}</p>}

        {!loading && !err && bookings.length === 0 && (
          <p>No bookings found yet.</p>
        )}

        {!loading && !err && bookings.length > 0 && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Event</th>
                  <th>Venue</th>
                  <th>Date</th>
                  <th>Guests</th>
                  <th>Amount (₹)</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.user?.email || "N/A"}</td>
                    <td>{b.eventName}</td>
                    <td>{b.venueName}</td>
                    <td>
                      {b.date ? new Date(b.date).toLocaleDateString() : "-"}
                    </td>
                    <td>{b.guests}</td>
                    <td>{b.totalAmount}</td>
                    <td>
                      <select
                        value={b.status}
                        onChange={(e) =>
                          handleChange(b._id, "status", e.target.value)
                        }
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={b.paymentStatus}
                        onChange={(e) =>
                          handleChange(b._id, "paymentStatus", e.target.value)
                        }
                      >
                        {paymentOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        disabled={savingId === b._id}
                        onClick={() => handleSave(b)}
                      >
                        {savingId === b._id ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBookings;
