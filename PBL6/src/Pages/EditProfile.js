import React, { useEffect, useState } from "react";
import "./EditProfile.scss";
import defaultAvatar from "../assets/images/avatar.png";

const EditProfile = () => {
  // State cho hiển thị
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [fileAvatar, setFileAvatar] = useState(null);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // State cho Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setDisplayName(user.displayName || "");
      setAvatar(user.avatar || defaultAvatar);
      setEmail(user.email || "");
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
      setFileAvatar(file);
    }
  };

  const handleSendCode = async () => {
    if (!newEmail) {
      alert("Please enter your new email address first!");
      return;
    }
    try {
      const response = await fetch(
        "https://sip-in-ease.duckdns.org/api/send-verification-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: newEmail }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        alert("Verification code has been sent to your new email.");
      } else {
        alert(
          `Error: ${result.message || "Failed to send verification code."}`
        );
      }
    } catch (error) {
      console.error("Error sending code:", error);
      alert("Server error while sending verification code.");
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || token === "undefined") {
        alert("Authentication failed. Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("displayName", displayName);
      formData.append("newEmail", newEmail);
      formData.append("verificationCode", verificationCode);

      if (fileAvatar) {
        formData.append("avatar", fileAvatar);
      }

      const response = await fetch(
        "https://sip-in-ease.duckdns.org/api/update-profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Profile updated successfully!");
        localStorage.setItem("user", JSON.stringify(result.user));
        window.location.reload();
      } else {
        alert(`Error: ${result.message || "Failed to update profile."}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Server error while updating profile.");
    }
  };

  // --- HÀM XỬ LÝ ĐỔI MẬT KHẨU ---
  const handlePasswordInput = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmitPassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://sip-in-ease.duckdns.org/api/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert("Password changed successfully!");
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        alert(`Error: ${result.message || "Failed to change password."}`);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Server error while changing password.");
    }
  };

  return (
    <div className="edit-profile">
      <h1 className="title">Edit Profile</h1>
      <div className="avatar-section">
        <img src={avatar} alt="User Avatar" className="avatar-image" />
        <label htmlFor="avatarUpload" className="edit-avatar-btn">
          Edit Avatar
        </label>
        <input
          id="avatarUpload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
      <div className="info-section">
        <div className="info-item">
          <label>Current Email</label>
          <input
            className="input-field"
            type="email"
            value={email}
            readOnly
            disabled
          />
        </div>
        <div className="info-item">
          <label>Display Name</label>
          <input
            className="input-field"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="info-item">
          <label>New Email</label>
          <input
            className="input-field"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter new email"
          />
        </div>
        <div className="info-item">
          <label>Verification Code</label>
          <input
            className="input-field"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
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

      <div className="button-section">
        <button
          className="change-password-btn"
          onClick={() => setShowPasswordModal(true)} // <--- THÊM DÒNG NÀY ĐỂ MỞ MODAL
        >
          Change Password
        </button>
        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Change Password</h2>
            <div className="modal-body">
              <div className="modal-item">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInput}
                  placeholder="Enter current password"
                />
              </div>
              <div className="modal-item">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInput}
                  placeholder="Enter new password"
                />
              </div>
              <div className="modal-item">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInput}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleSubmitPassword}>
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
