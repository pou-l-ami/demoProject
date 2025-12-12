// client/src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";
import loginImg from "../assets/images/login.png";
import userIcon from "../assets/images/user.png";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // page user wanted before being redirected to login
  const from = location.state?.from?.pathname;

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/auth/login",
        {
          email: credentials.email,
          password: credentials.password
        },
        { withCredentials: true }
      );

      console.log("LOGIN RESPONSE:", res.data);

      // store auth info
      localStorage.setItem(
        "auth",
        JSON.stringify({
          token: res.data.token,
          role: res.data.role,
          user: res.data.data
        })
      );

      setMsg("Login successful! Redirecting...");

      // default redirect based on role
      let defaultPath = "/user";
      if (res.data.role === "admin") {
        defaultPath = "/admin";
      }

      // if user was redirected from a protected page (e.g. /buy-products), go back there
      const target = from || defaultPath;

      navigate(target, { replace: true });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      const backendMsg = err.response?.data?.message;
      setMsg(backendMsg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form__container">
      <div className="login__container">
        <div className="login__content">
          <img src={loginImg} alt="" />
        </div>

        <div className="login__form">
          <div className="user">
            <img src={userIcon} alt="" />
          </div>
          <h2>Login</h2>

          <form onSubmit={handleClick}>
            <input
              type="email"
              placeholder="Email"
              required
              id="email"
              value={credentials.email}
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Password"
              required
              id="password"
              value={credentials.password}
              onChange={handleChange}
            />

            {msg && <p className="auth-message">{msg}</p>}

            <button
              className="btn primary__btn auth__btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <p>
              don't have an account? <Link to="/register">Create</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
