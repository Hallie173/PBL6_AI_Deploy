import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access denied!" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔓 Token decoded:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ JWT Verification Error:", error);
    return res.status(401).json({ message: "Invalid token!" });
  }
};
