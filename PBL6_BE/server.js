// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import apiRoutes from "./src/routes/api.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import alertsRoutes from "./src/routes/alertsRoutes.js";
import evidenceRoutes from "./src/routes/evidenceRoutes.js";
import { sequelize } from "./src/models/index.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTION"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options(/.*/, cors());

app.use("/uploads", express.static("uploads"));

app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));

app.use("/api", apiRoutes);
app.use("/api", aiRoutes);
app.use("/api", alertsRoutes);
app.use("/api", evidenceRoutes);

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected");

    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });
