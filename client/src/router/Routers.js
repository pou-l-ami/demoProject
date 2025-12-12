// client/src/router/Routers.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import About from "../pages/About";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Events from "../pages/Events";
import EventDetails from "../pages/EventDetails";
import Notification from "../pages/Notification";
import SearchResultList from "../pages/SearchResultList";
import Gallery from "../pages/Gallery";
import Team from "../pages/Team";
import BuyProducts from "../pages/user/BuyProducts.jsx";

import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ViewBookings from "../pages/admin/ViewBookings";
import ViewPayments from "../pages/admin/ViewPayments";
import EditStock from "../pages/admin/EditStock";
import Report from "../pages/admin/Report";
import Notifications from "../pages/admin/Notifications";

import UserDashboard from "../pages/user/UserDashboard";
import MyBookings from "../pages/user/MyBookings";
import MyPayments from "../pages/user/MyPayments";

import { ProtectedRoute } from "./ProtectedRoute";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/team" element={<Team />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/events/search" element={<SearchResultList />} />
      <Route path="/notification" element={<Notification />} />

      {/* ✅ Buy Products – user must be logged in (any role) */}
      <Route
        path="/buy-products"
        element={
          <ProtectedRoute>
            <BuyProducts />
          </ProtectedRoute>
        }
      />

      {/* USER DASHBOARD */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/bookings"
        element={
          <ProtectedRoute allowRole="user">
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/payments"
        element={
          <ProtectedRoute allowRole="user">
            <MyPayments />
          </ProtectedRoute>
        }
      />

      {/* ADMIN DASHBOARD with nested pages */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="bookings" element={<ViewBookings />} />
        <Route path="payments" element={<ViewPayments />} />
        <Route path="stock" element={<EditStock />} />
        <Route path="report" element={<Report />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
    </Routes>
  );
};

export default Routers;


