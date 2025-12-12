import React from "react";
import { useState } from "react";
import "./SignupPage.scss";
import webLogo from "../assets/images/logo.png";
import { Link } from "react-router-dom";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const handleSendCode = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }

    try {
      const response = await fetch(
        "https://sip-in-ease.duckdns.org/api/send-verification-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Verification code has been sent to your email.");
      } else {
        const errorMessage =
          result.message ||
          "Failed to send verification code. Please try again!";
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Send code error:", error);
      alert(
        "Unable to connect to the server. Please check the backend server."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    const data = {
      email,
      displayName,
      password,
      verificationCode,
    };

    try {
      const response = await fetch(
        "https://sip-in-ease.duckdns.org/api/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Signup successful!");
        window.location.href = "/";
      } else {
        const errorMessage =
          result.message || "Signup failed! Please try again!";
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Server connection error. Please check the backend server.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <div className="signup-wrapper">
          <img
            src={webLogo}
            alt="Abnormal Situation Detection System"
            className="signup-logo"
          />
          <h2 className="signup-title">Create your account</h2>
        </div>

        <div className="signup-form-container">
          <form className="signup-form-content" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Username */}
            <div className="form-group">
              <label htmlFor="display-name">Display Name</label>
              <input
                id="display-name"
                name="display-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Email Verifying Code */}
            <div className="form-group verify-group">
              <label htmlFor="verify-code">Email Verifying Code</label>
              <div className="verify-row">
                <input
                  id="verify-code"
                  name="verify-code"
                  type="text"
                  required
                  placeholder="Enter code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button
                  type="button"
                  className="send-code-btn"
                  onClick={handleSendCode}
                >
                  Send Code
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn">
              Sign up
            </button>
          </form>

          <p className="login-link">
            Already have an account?{" "}
            <Link to="/login" className="link">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
