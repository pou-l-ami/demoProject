import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/register.css"; // path is from src/pages -> src/styles
import { BASE_URL } from "../utils/config.js";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    photo: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      // ✅ MUST match your backend:
      // app.use('/api/v1/auth', authRoute)
      const res = await axios.post(
        `${BASE_URL}/api/v1/auth/register`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          photo: formData.photo,
        },
        {
          withCredentials: true, // ok because cors({ origin: true, credentials: true })
        }
      );

      console.log("REGISTER RESPONSE:", res.data);
      setMsg("User successfully registered! Redirecting to login...");

      // redirect after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("REGISTER ERROR:", err);

      // if backend sent a message, show it; otherwise generic
      const backendMsg = err.response?.data?.message;
      setMsg(backendMsg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-left">
            <h2 className="auth-title">Create An Account</h2>
            <p className="auth-subtitle">
              Join our Evenza to explore exciting events, manage bookings
              and stay updated.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Full Name</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your full name"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="photo">Photo URL (Optional)</label>
                <input
                  type="text"
                  id="photo"
                  name="photo"
                  placeholder="https://example.com/profile.jpg"
                  value={formData.photo}
                  onChange={handleChange}
                />
              </div>

              {msg && <p className="auth-message">{msg}</p>}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Login here
              </Link>
            </p>
          </div>

          <div className="auth-right">
            <h3>Welcome To Evenza 🎉</h3>
            <p>
              Discover curated events, manage your bookings and get notified
              about everything happening around you. Let’s make your moments
              memorable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
