import React, { useState } from "react";
import "./SignupPage.scss";
import webLogo from "../assets/images/logo.png";
import { Link } from "react-router-dom";

const EyeIcon = () => <span>👁️</span>;
const EyeSlashIcon = () => <span>🙈</span>;

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // --- THÊM STATE HIỂN THỊ ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          body: JSON.stringify({ email: email, type: "signup" }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        alert("Verification code has been sent to your email.");
      } else {
        alert(
          `Error: ${result.message || "Failed to send verification code."}`
        );
      }
    } catch (error) {
      console.error("Send code error:", error);
      alert("Unable to connect to the server.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    const data = { email, displayName, password, verificationCode };
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
        alert(`Error: ${result.message || "Signup failed!"}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Server connection error.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <div className="signup-wrapper">
          <img src={webLogo} alt="Logo" className="signup-logo" />
          <h2 className="signup-title">Create your account</h2>
        </div>

        <div className="signup-form-container">
          <form className="signup-form-content" onSubmit={handleSubmit}>
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

            {/* --- PASSWORD FIELD --- */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* --- CONFIRM PASSWORD FIELD --- */}
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className="password-wrapper">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

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
