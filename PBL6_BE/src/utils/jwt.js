import jwt from "jsonwebtoken";

export function generateToken(user) {
  return jwt.sign(
    {
      userID: user.userID,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}
