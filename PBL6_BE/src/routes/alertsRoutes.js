// src/routes/alertsRoutes.js

import express from "express";
import { authMiddleware } from "../controllers/authController.js";
import * as alertController from "../controllers/alertController.js";

const router = express.Router();

router.get("/alerts", authMiddleware, alertController.getAlerts);
router.delete("/alerts/:id", authMiddleware, alertController.deleteAlert);
router.get("/alerts/:id", authMiddleware, alertController.getAlertDetail);

export default router;
