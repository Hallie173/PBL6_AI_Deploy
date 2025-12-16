import React, { useEffect } from "react";
import "./Header.scss";
import logo from "../assets/images/logo.png";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [user, setUser] = React.useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("user");

    if (token && userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        <img src={logo} alt="Logo" className="header-logo-img" />
        <div className="header-title">SipCam</div>
        <div className="header-subtitle">To Sip In Ease and Sleep In Peace</div>
      </Link>

      <div className="header-buttons">
        {user ? (
          <>
            <span className="welcome-message">Welcome, {user.displayName}</span>
            <button className="logout-button" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/signup" className="signup-button">
              Sign Up
            </Link>
            <Link to="/login" className="login-button">
              Log In
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
