// client/src/pages/user/MyPayments.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import jsPDF from "jspdf";
// import "../../styles/user-dashboard.css";
// import "../../styles/admin-tables.css";

// const MyPayments = () => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   // filters
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

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
//         console.error("MyPayments error:", error);
//         setErr(
//           error.response?.data?.message ||
//             "Failed to load payments. Please try again."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, []);

//   // Only bookings that have some payment status (not purely unpaid)
//   const paidBookings = bookings.filter(
//     (b) => b.paymentStatus && b.paymentStatus !== "unpaid"
//   );

//   // ---------- FILTERED LIST ----------
//   const filtered = useMemo(() => {
//     return paidBookings.filter((b) => {
//       if (statusFilter !== "all" && b.paymentStatus !== statusFilter) {
//         return false;
//       }

//       const bookingDate = new Date(b.date);

//       if (fromDate) {
//         const from = new Date(fromDate);
//         from.setHours(0, 0, 0, 0);
//         if (bookingDate < from) return false;
//       }

//       if (toDate) {
//         const to = new Date(toDate);
//         to.setHours(23, 59, 59, 999);
//         if (bookingDate > to) return false;
//       }

//       return true;
//     });
//   }, [paidBookings, statusFilter, fromDate, toDate]);

//   // ---------- PDF INVOICE ----------
//   const handleDownloadInvoice = (booking) => {
//     const doc = new jsPDF();
//     let y = 15;
//     const lineHeight = 7;

//     const addLine = (text, bold = false) => {
//       doc.setFont("helvetica", bold ? "bold" : "normal");
//       const lines = doc.splitTextToSize(text, 180);
//       lines.forEach((line) => {
//         if (y > 280) {
//           doc.addPage();
//           y = 15;
//         }
//         doc.text(line, 15, y);
//         y += lineHeight;
//       });
//     };

//     doc.setFontSize(18);
//     addLine("Event Management - Booking Invoice", true);

//     doc.setFontSize(11);
//     y += 2;
//     addLine(`Invoice ID: ${booking._id}`);
//     addLine(
//       `Booking Date: ${new Date(booking.date).toLocaleString()}`
//     );
//     addLine(`Created At: ${new Date(booking.createdAt).toLocaleString()}`);
//     addLine(`Status: ${booking.status}`);
//     addLine(`Payment Status: ${booking.paymentStatus}`);

//     y += 4;
//     addLine("Booking Details:", true);
//     addLine(`Event: ${booking.eventName}`);
//     addLine(`Venue: ${booking.venueName}`);
//     if (booking.guests) addLine(`Guests: ${booking.guests}`);
//     addLine(`Total Amount: ₹ ${booking.totalAmount}`, true);

//     doc.save(`invoice-${booking._id.slice(-6)}.pdf`);
//   };

//   return (
//     <section className="user-page">
//       <div className="admin-card">
//         <h2>My Payments</h2>
//         <p className="subtitle">
//           Payment information for your event bookings. Use filters or download
//           invoice PDFs.
//         </p>

//         {loading && <p className="info-text">Loading payments...</p>}
//         {err && !loading && <p className="info-text error">{err}</p>}

//         {/* ---------- FILTER BAR ---------- */}
//         {!loading && !err && (
//           <div className="payments-filters">
//             <div className="filter-group">
//               <label>Status</label>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//               >
//                 <option value="all">All</option>
//                 <option value="paid">paid</option>
//                 <option value="partial">partial</option>
//                 <option value="pending">pending</option>
//               </select>
//             </div>

//             <div className="filter-group">
//               <label>From</label>
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//               />
//             </div>

//             <div className="filter-group">
//               <label>To</label>
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//               />
//             </div>
//           </div>
//         )}

//         {!loading && !err && filtered.length === 0 && (
//           <p className="info-text">No payments found for selected filters.</p>
//         )}

//         {!loading && !err && filtered.length > 0 && (
//           <div className="table-wrap">
//             <table className="admin-table">
//               <thead>
//                 <tr>
//                   <th>Event</th>
//                   <th>Venue</th>
//                   <th>Amount (₹)</th>
//                   <th>Payment Status</th>
//                   <th>Event Date</th>
//                   <th>Invoice</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((b) => (
//                   <tr key={b._id}>
//                     <td>{b.eventName}</td>
//                     <td>{b.venueName}</td>
//                     <td>{b.totalAmount}</td>
//                     <td>{b.paymentStatus}</td>
//                     <td>{new Date(b.date).toLocaleDateString()}</td>
//                     <td>
//   <button
//     className="btn small primary__btn"
//     onClick={() => window.open(`http://localhost:8000/api/v1/payment/invoice/${b._id}`, "_blank")}
//   >
//     View Invoice
//   </button>
// </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default MyPayments;


import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import "../../styles/user-dashboard.css";
import "../../styles/admin-tables.css";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const MyPayments = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BACKEND_URL}/api/v1/booking/my-bookings`,
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

  const paidBookings = bookings.filter((b) => b.paymentStatus === "paid");

  const downloadInvoice = (b) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Event Management - Invoice", 20, 20);

    doc.setFontSize(12);
    doc.text(`Invoice ID: ${b._id}`, 20, 35);
    doc.text(`Event: ${b.eventName}`, 20, 45);
    doc.text(`Venue: ${b.venueName}`, 20, 55);
    doc.text(
      `Date: ${new Date(b.date).toLocaleDateString()}`,
      20,
      65
    );
    doc.text(`Guests: ${b.guests}`, 20, 75);

    doc.text(`Amount (₹): ${b.totalAmount}`, 20, 95);
    doc.text(`Payment Status: ${b.paymentStatus}`, 20, 105);
    if (b.paymentMode) doc.text(`Payment Mode: ${b.paymentMode}`, 20, 115);
    if (b.transactionId)
      doc.text(`Transaction ID: ${b.transactionId}`, 20, 125);

    doc.text("Thank you for your booking!", 20, 150);

    doc.save(`invoice_${b._id}.pdf`);
  };

  return (
    <section className="user-page">
      <div className="admin-card">
        <h2>My Payments</h2>
        <p className="subtitle">
          Payment information for your bookings (only paid bookings listed
          below).
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
                  <th>Transaction</th>
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
                    <td>
                      <button
                        className="btn secondary__btn btn-sm"
                        onClick={() => downloadInvoice(b)}
                      >
                        Download Invoice
                      </button>
                    </td>
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

