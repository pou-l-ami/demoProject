// client/src/Components/Header/Header.jsx
import React, { useEffect, useState } from "react";
import { Button } from "reactstrap";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { AiOutlineMenu } from "react-icons/ai";
import Swal from "sweetalert2";
import "./Header.css";

const nav__links = [
  { path: "/home", display: "Home" },
  { path: "/about", display: "About" },
  { path: "/events", display: "Events (AI Recommend)" },
  { path: "/gallery", display: "Gallery" },
  { path: "/team", display: "Team" },
  { path: "/buy-products", display: "Buy Products" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem("auth");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
  };

  const handleScroll = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // keep auth in sync on route change
  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth");
      setAuth(raw ? JSON.parse(raw) : null);
    } catch {
      setAuth(null);
    }
  }, [location.pathname]);

  // sync auth across tabs
  useEffect(() => {
    const onStorage = () => {
      try {
        const raw = localStorage.getItem("auth");
        setAuth(raw ? JSON.parse(raw) : null);
      } catch {
        setAuth(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "You will be logged out from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e63946",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("auth");
        setAuth(null);
        navigate("/login", { replace: true });
      }
    });
  };

  const isLoggedIn = !!auth?.token;
  const isBuyProductsPage = location.pathname === "/buy-products";

  const username =
    auth?.user?.username || auth?.user?.name || auth?.user?.email;

  const isAdmin = auth?.role === "admin";
  const isUser = auth?.role === "user";
  const linksToRender = isAdmin
    ? [...nav__links, { path: "/admin", display: "Admin Panel" }]
    : isUser
    ? [...nav__links, { path: "/user/bookings", display: "My Bookings" }]
    : nav__links;

  return (
    <header className="header">
      <div
        className={`menu-btn ${isMenuOpen ? "active" : ""}`}
        onClick={toggleMenu}
      >
        <i>
          <AiOutlineMenu />
        </i>
      </div>

      <div className="navbar__logo">
        <img src={logo} alt="Event Management" />
      </div>

      <nav className={`navbar__links ${isMenuOpen ? "active" : ""}`}>
        <ul>
          {linksToRender.map((item, index) => (
            <li
              className="navbar__links__item"
              key={index}
              onClick={toggleMenu}
            >
              <NavLink
                to={item.path}
                className={(navClass) =>
                  navClass.isActive ? "active__link" : ""
                }
              >
                {item.display}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="navbar__right__btns">
        <button className="dark-theme-toggle" onClick={toggleTheme} title="Toggle Theme" style={{ background: "transparent", border: "none", fontSize: "2.2rem", cursor: "pointer", marginRight: "2rem", display: "inline-flex", alignItems: "center" }}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {isLoggedIn ? (
          <>
            {username && (
              <span className="navbar__user__name">{username}</span>
            )}
            <Button className="btn secondary__btn" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          // when not logged in, don't show buttons on Buy Products page
          !isBuyProductsPage && (
            <>
              <Button className="btn secondary__btn">
                <Link to="/login">Login</Link>
              </Button>
              <Button className="btn primary__btn">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )
        )}
      </div>
    </header>
  );
};

export default Header;
