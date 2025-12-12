import express from "express";
import * as evidenceController from "../controllers/evidenceController.js";

const router = express.Router();

router.post("/alerts/evidence", evidenceController.receiveEvidence);

export default router;
