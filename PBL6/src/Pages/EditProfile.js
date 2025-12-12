import React, { useEffect, useState } from "react";
import "./EditProfile.scss";
import defaultAvatar from "../assets/images/avatar.png";

const EditProfile = () => {
  // State cho hiển thị (có thể là URL tạm thời hoặc URL từ server)
  const [avatar, setAvatar] = useState(defaultAvatar); // State mới để lưu trữ File Object cho việc gửi lên server
  const [fileAvatar, setFileAvatar] = useState(null);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
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
  }, []); // HÀM XỬ LÝ CHỌN FILE

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Cập nhật state 'avatar' bằng URL tạm thời để hiển thị preview
      setAvatar(URL.createObjectURL(file)); // Lưu File object vào state để chuẩn bị gửi lên server
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
  }; // HÀM XỬ LÝ LƯU (SỬ DỤNG FormData)

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || token === "undefined") {
        // Kiểm tra token bị thiếu/undefined
        alert("Authentication failed. Please log in again.");
        return;
      }

      // Khởi tạo FormData để gửi file và các trường dữ liệu
      const formData = new FormData();
      formData.append("displayName", displayName);
      formData.append("newEmail", newEmail);
      formData.append("verificationCode", verificationCode);

      // Thêm file avatar nếu tồn tại
      if (fileAvatar) {
        // Tên trường 'avatar' phải khớp với upload.single('avatar') ở backend
        formData.append("avatar", fileAvatar);
      }

      const response = await fetch(
        "https://sip-in-ease.duckdns.org/api/update-profile",
        {
          method: "PUT",
          headers: {
            // QUAN TRỌNG: KHÔNG ĐẶT "Content-Type" KHI DÙNG FormData
            Authorization: `Bearer ${token}`,
          },
          body: formData, // Gửi FormData object
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

  const handlePasswordInput = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmitPassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // Validate cơ bản
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
        "https://sip-in-ease.duckdns.org/api/change-password", // Giả sử API endpoint là này
        {
          method: "POST", // Hoặc PUT tùy backend của bạn
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
      <h1 className="title">Edit Profile</h1>{" "}
      <div className="avatar-section">
        <img src={avatar} alt="User Avatar" className="avatar-image" />{" "}
        <label htmlFor="avatarUpload" className="edit-avatar-btn">
          Edit Avatar{" "}
        </label>{" "}
        <input
          id="avatarUpload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange} // <--- Thêm xử lý onChange
        />{" "}
      </div>{" "}
      <div className="info-section">
        {/* Current Email (readonly) */}{" "}
        <div className="info-item">
          <label>Current Email</label>{" "}
          <input
            className="input-field"
            type="email"
            value={email}
            readOnly
            disabled
          />{" "}
        </div>{" "}
        <div className="info-item">
          <label>Display Name</label>{" "}
          <input
            className="input-field"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />{" "}
        </div>{" "}
        <div className="info-item">
          <label>New Email</label>{" "}
          <input
            className="input-field"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter new email"
          />{" "}
        </div>{" "}
        <div className="info-item">
          <label>Verification Code</label>{" "}
          <input
            className="input-field"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
          />{" "}
          <button
            type="button"
            className="send-code-btn"
            onClick={handleSendCode}
          >
            Send Code{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="button-section">
        <button className="change-password-btn">Change Password</button>{" "}
        <button className="save-btn" onClick={handleSave}>
          Save{" "}
        </button>{" "}
      </div>{" "}
      {/* --- MODAL CHANGE PASSWORD --- */}
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
