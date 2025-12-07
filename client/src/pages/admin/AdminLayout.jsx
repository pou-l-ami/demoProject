// src/pages/admin/AdminLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../../styles/admin-layout.css";

const AdminLayout = () => {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="logo-dot" />
          <div>
            <p className="logo-title">Events Admin</p>
            <p className="logo-sub">Control Center</p>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/bookings">Bookings</NavLink>
          <NavLink to="/admin/payments">Payments</NavLink>
          <NavLink to="/admin/stock">Stock</NavLink>
          <NavLink to="/admin/report">Reports</NavLink>
          <NavLink to="/admin/notifications">Notifications</NavLink>
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
