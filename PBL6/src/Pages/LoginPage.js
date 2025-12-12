import React from "react";
import "./LoginPage.scss";
import webLogo from "../assets/images/logo.png";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://sip-in-ease.duckdns.org/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Login successfully!");

        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));

        window.location.href = "/";
      } else {
        alert(`Login failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(
        "Unable to connect to the server. Please check the backend server."
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <img src={webLogo} alt="Your Company" className="login-logo" />
          <h2 className="login-title">Sign in to your account</h2>
        </div>

        <div className="login-form-container">
          <form className="login-form-content" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <div className="form-label-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <Link
                  to="/reset-password"
                  state={{ email: email }}
                  className="forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="form-input"
              />
            </div>

            <button type="submit" className="login-button">
              Log in
            </button>
          </form>

          <p className="signup-text">
            Not a member?{" "}
            <Link to="/signup" className="signup-link">
              Sign up now!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
