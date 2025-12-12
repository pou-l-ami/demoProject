// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "../../styles/user-dashboard.css";
// import "../../styles/admin-tables.css";

// const MyBookings = () => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     const fetchBookings = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(
//           "http://localhost:8000/api/v1/booking/my-bookings",
//           { withCredentials: true }
//         );
//         setBookings(res.data.data || []);
//       } catch (error) {
//         console.error("MyBookings error:", error);
//         setErr(
//           error.response?.data?.message ||
//             "Failed to load bookings. Please try again."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, []);

//   return (
//     <section className="user-page">
//       <div className="admin-card">
//         <h2>My Bookings</h2>
//         <p className="subtitle">
//           All event bookings you have created in the system.
//         </p>

//         {loading && <p className="info-text">Loading bookings...</p>}
//         {err && !loading && <p className="info-text error">{err}</p>}

//         {!loading && !err && bookings.length === 0 && (
//           <p className="info-text">
//             You don't have any bookings yet. Go to Events and create one.
//           </p>
//         )}

//         {!loading && !err && bookings.length > 0 && (
//           <>
//             {/* Top summary cards */}
//             <div className="dashboard-grid" style={{ marginBottom: "1.2rem" }}>
//               <div className="stat-card">
//                 <span className="stat-label">Total Bookings</span>
//                 <span className="stat-value">{bookings.length}</span>
//               </div>
//               <div className="stat-card">
//                 <span className="stat-label">Confirmed</span>
//                 <span className="stat-value">
//                   {bookings.filter((b) => b.status === "confirmed").length}
//                 </span>
//               </div>
//               <div className="stat-card">
//                 <span className="stat-label">Pending</span>
//                 <span className="stat-value">
//                   {bookings.filter((b) => b.status === "pending").length}
//                 </span>
//               </div>
//             </div>

//             {/* Table */}
//             <div className="table-wrap">
//               <table className="admin-table">
//                 <thead>
//                   <tr>
//                     <th>Event</th>
//                     <th>Venue</th>
//                     <th>Date</th>
//                     <th>Guests</th>
//                     <th>Amount (₹)</th>
//                     <th>Status</th>
//                     <th>Payment</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {bookings.map((b) => (
//                     <tr key={b._id}>
//                       <td>{b.eventName}</td>
//                       <td>{b.venueName}</td>
//                       <td>{new Date(b.date).toLocaleDateString()}</td>
//                       <td>{b.guests}</td>
//                       <td>{b.totalAmount}</td>
//                       <td>
//                         <span className={`status-pill ${b.status}`}>
//                           {b.status}
//                         </span>
//                       </td>
//                       <td>{b.paymentStatus}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         )}
//       </div>
//     </section>
//   );
// };

// export default MyBookings;

import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/user-dashboard.css";
import "../../styles/admin-tables.css";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/booking/my-bookings`,
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

  useEffect(() => {
    fetchBookings();
  }, []);

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayNow = async (booking) => {
    try {
      // 1) Create order on backend
      const orderRes = await axios.post(
        `${BACKEND_URL}/api/v1/payments/create-order`,
        { bookingId: booking._id },
        { withCredentials: true }
      );

      const order = orderRes.data.data;

      const loaded = await loadRazorpay();
      if (!loaded) {
        alert("Razorpay SDK failed to load. Check your connection.");
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Event Management",
        description: booking.eventName,
        order_id: order.id,
        handler: async function (response) {
          try {
            await axios.post(
              `${BACKEND_URL}/api/v1/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking._id,
              },
              { withCredentials: true }
            );
            alert("Payment successful!");
            fetchBookings(); // refresh table
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: booking.user?.username || "",
          email: booking.user?.email || "",
        },
        theme: {
          color: "#e63946",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("handlePayNow error:", error);
      alert(
        error.response?.data?.message ||
          "Unable to initiate payment. Try again later."
      );
    }
  };

  return (
    <section className="user-page">
      <div className="admin-card">
        <h2>My Bookings</h2>
        <p className="subtitle">
          All event & product bookings you have created in the system.
        </p>

        {loading && <p className="info-text">Loading bookings...</p>}
        {err && !loading && <p className="info-text error">{err}</p>}

        {!loading && !err && bookings.length === 0 && (
          <p className="info-text">
            You don't have any bookings yet. Go to Events or Buy Products and
            create one.
          </p>
        )}

        {!loading && !err && bookings.length > 0 && (
          <>
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
                    <th>Action</th>
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
                      <td>
                        {b.paymentStatus !== "paid" && (
                          <button
                            className="btn primary__btn btn-sm"
                            onClick={() => handlePayNow(b)}
                          >
                            Pay Now
                          </button>
                        )}
                      </td>
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
