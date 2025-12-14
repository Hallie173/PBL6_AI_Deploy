import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "./ResetPassword.scss";
import webLogo from "../assets/images/logo.png";

const EyeIcon = () => <span>👁️</span>;
const EyeSlashIcon = () => <span>🙈</span>;

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || "";

  const [email] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // --- STATE ẨN HIỆN ---
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    if (!initialEmail) {
      alert("No email provided. Redirecting to login...");
      navigate("/login");
    }
  }, [initialEmail, navigate]);

  const handleSendCode = async () => {
    if (!email) return;
    try {
      const response = await fetch(
        "https://sip-in-ease.duckdns.org/api/send-verification-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: initialEmail, type: "reset_password" }),
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
      alert("Unable to connect to server.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!verificationCode) {
      alert("Please enter the verification code sent to your email.");
      return;
    }
    const data = { email, verificationCode, newPassword };
    try {
      const response = await fetch(
        "https://sip-in-ease.duckdns.org/api/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      if (response.ok) {
        alert(
          "Password reset successful! Please login with your new password."
        );
        navigate("/login");
      } else {
        alert(`Error: ${result.message || "Reset password failed!"}`);
      }
    } catch (error) {
      console.error("Reset error:", error);
      alert("Server connection error.");
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-form">
        <div className="reset-wrapper">
          <img src={webLogo} alt="System Logo" className="reset-logo" />
          <h2 className="reset-title">Reset Password</h2>
          <p className="reset-subtitle">
            Enter verification code and new password
          </p>
        </div>

        <div className="reset-form-container">
          <form className="reset-form-content" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                readOnly
                disabled={!email}
              />
            </div>

            <div className="form-group verify-group">
              <label htmlFor="verify-code">Verification Code</label>
              <div className="verify-row">
                <input
                  id="verify-code"
                  name="verify-code"
                  type="text"
                  required
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button
                  type="button"
                  className="send-code-btn"
                  onClick={handleSendCode}
                  disabled={!email}
                >
                  Send Code
                </button>
              </div>
            </div>

            {/* --- NEW PASSWORD --- */}
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <div className="password-wrapper">
                <input
                  id="new-password"
                  name="new-password"
                  type={showNewPass ? "text" : "password"}
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowNewPass(!showNewPass)}
                >
                  {showNewPass ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* --- CONFIRM PASSWORD --- */}
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <div className="password-wrapper">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPass ? "text" : "password"}
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                >
                  {showConfirmPass ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Reset Password
            </button>
          </form>

          <div className="back-link">
            <Link to="/login" className="link">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
