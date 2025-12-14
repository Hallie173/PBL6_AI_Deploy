import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "./ResetPassword.scss";
import webLogo from "../assets/images/logo.png";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy email được truyền từ trang trước (Forgot Password Page)
  // Nếu không có, mặc định là chuỗi rỗng (nhưng input sẽ bị disable)
  const initialEmail = location.state?.email || "";

  const [email] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    if (!initialEmail) {
      alert("No email provided. Redirecting to login...");
      navigate("/login");
    }
  }, [initialEmail, navigate]);

  // Logic gửi code (Tái sử dụng từ Signup)
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
        const errorMessage =
          result.message || "Failed to send verification code.";
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Send code error:", error);
      alert("Unable to connect to server.");
    }
  };

  // Logic Reset Password
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

    const data = {
      email,
      verificationCode,
      newPassword,
    };

    try {
      // Giả định API endpoint là /api/reset-password
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
        const errorMessage =
          result.message || "Reset password failed! Please check your code.";
        alert(`Error: ${errorMessage}`);
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
            {/* Email (Read Only) */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                readOnly // Chỉ đọc theo yêu cầu
                disabled={!email} // Disable visual style nếu rỗng
              />
            </div>

            {/* Verification Code + Send Button */}
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
            {/* New Password */}
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Submit Button */}
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
