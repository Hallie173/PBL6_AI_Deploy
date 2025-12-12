import express from "express";
import { detectFrame } from "../controllers/aiController.js";

const router = express.Router();

router.post("/detect_frame", detectFrame);

export default router;
