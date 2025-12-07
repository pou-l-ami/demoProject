import React from "react";
import { Navigate } from "react-router-dom";

const getAuth = () => {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const ProtectedRoute = ({ children, allowRole }) => {
  const auth = getAuth();

  if (!auth || !auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (allowRole && auth.role !== allowRole) {
    // logged in but wrong role
    return <Navigate to="/home" replace />;
  }

  return children;
};

