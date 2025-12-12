import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { sendVerificationCode } from "../services/emailService.js";
import {
  generateCode,
  saveCode,
  verifyEmailCode,
} from "../services/verificationService.js";
import { generateToken } from "../utils/jwt.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

// --- MIDDLEWARE ---

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Access denied!" });
    }
    const token = authHeader.split(" ")[1]; // Bearer TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userID, email }
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(401).json({ message: "Invalid token!" });
  }
};

// --- CẤU HÌNH MULTER ---

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "avatar_" + Date.now() + ext);
  },
});

export const upload = multer({ storage });

// --- AUTH CONTROLLERS ---

export const sendCode = async (req, res) => {
  try {
    const { email } = req.body;

    const code = generateCode();
    saveCode(email, code);

    await sendVerificationCode(email, code);

    return res.status(200).json({ message: "Verification code sent." });
  } catch (error) {
    console.error("Error sending code:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const signup = async (req, res) => {
  try {
    const { email, displayName, password, verificationCode } = req.body; // ✅ Verify code

    const isValid = verifyEmailCode(email, verificationCode);
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code." });
    }

    if (!email || !displayName || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      displayName,
      passwordHash: hash,
      avatar: null,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        userID: newUser.userID,
        email: newUser.email,
        displayName: newUser.displayName,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password." });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Email not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password!" });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successfully!",
      token,
      user: {
        userID: user.userID,
        email: user.email,
        displayName: user.displayName,
        avatar: `http://localhost:8080/${user.avatar}`,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, verificationCode, newPassword } = req.body;

    if (!email || !verificationCode || !newPassword) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const isValid = verifyEmailCode(email, verificationCode);
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    user.passwordHash = hash;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --- PROFILE CONTROLLERS ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const updateProfile = async (req, res) => {
  try {
    // req.user được gán từ authMiddleware
    const userID = req.user.userID;
    // Dữ liệu từ FormData (file đã được xử lý bởi multer)
    const { displayName, newEmail, verificationCode } = req.body;

    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (newEmail && newEmail !== user.email) {
      const isValid = verifyEmailCode(newEmail, verificationCode);
      if (!isValid) {
        return res
          .status(400)
          .json({ message: "Invalid or expired verification code." });
      }

      const existingEmail = await User.findOne({ where: { email: newEmail } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use." });
      }

      user.email = newEmail;
    }

    // Xử lý file (req.file chỉ tồn tại nếu frontend gửi FormData chứa file)
    if (req.file) {
      if (user.avatar && fs.existsSync(user.avatar)) {
        fs.unlinkSync(user.avatar); // Xóa avatar cũ
      }

      const avatarPath = `uploads/${req.file.filename}`;
      user.avatar = avatarPath; // Lưu path mới
    }

    if (displayName) user.displayName = displayName;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        userID: user.userID,
        email: user.email,
        displayName: user.displayName,
        avatar: `http://localhost:8080/${user.avatar}`,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userID = req.user.userID;

    const user = await User.findByPk(userID);

    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match)
      return res.status(400).json({ message: "Old password incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password updated" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};
