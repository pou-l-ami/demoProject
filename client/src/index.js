import React from "react";
import ReactDOM  from "react-dom/client";
import axios from "axios";

import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Automatically add JWT Token from localStorage to every Axios request (fixes cross-site cookie blocking)
axios.interceptors.request.use(
  (config) => {
    try {
      const authData = localStorage.getItem("auth");
      if (authData) {
        const { token } = JSON.parse(authData);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error("Error setting axios authorization header:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </React.StrictMode>

)