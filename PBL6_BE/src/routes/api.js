// src/routes/api.js
import express from "express";
import multer from "multer";
import path from "path";

import {
  sendCode,
  signup,
  login,
  resetPassword,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/send-verification-code", sendCode);
router.post("/signup", signup);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "This is a protected profile route.",
    user: req.user,
  });
});

router.put(
  "/update-profile",
  authMiddleware,
  upload.single("avatar"),
  updateProfile
);

router.post("/change-password", authMiddleware, changePassword);

export default router;
