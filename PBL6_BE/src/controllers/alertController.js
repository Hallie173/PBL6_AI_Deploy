import { or } from "sequelize";
import fs from "fs";
import path from "path";
import { Alert, AlertEvidence } from "../models/index.js";

export const getAlerts = async (req, res) => {
  try {
    const userID = req.user?.userID;

    if (!userID) {
      return res.status(400).json({ message: "Missing userID" });
    }

    const alerts = await Alert.findAll({
      where: { userID },
      order: [["created_at", "DESC"]],
    });

    res.json({ ok: true, alerts });
  } catch (e) {
    console.error("❌ ERROR in getAlerts:", e);
    res.status(500).json({ message: "Server error", error: e.toString() });
  }
};

export const getAlertDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user?.userID;

    if (!id) return res.status(400).json({ message: "Missing Alert ID" });

    const alert = await Alert.findOne({
      where: { alertID: id, userID },
      include: [
        {
          model: AlertEvidence,
          as: "evidences",
          attributes: ["evidenceID", "imageUrl", "timestamp", "sequenceIndex"],
        },
      ],
      order: [
        [{ model: AlertEvidence, as: "evidences" }, "sequenceIndex", "ASC"],
      ],
    });

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json({ ok: true, alert });
  } catch (e) {
    console.error("❌ ERROR getting alert detail:", e);
    res.status(500).json({ message: "Server error", error: e.toString() });
  }
};

export const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user?.userID;

    if (!id) {
      return res.status(400).json({ message: "Missing alert ID" });
    }

    const alert = await Alert.findOne({
      where: { alertID: id, userID: userID },
    });

    if (!alert) {
      return res
        .status(404)
        .json({ message: "Alert not found or permission denied" });
    }

    if (alert.snapshot_url) {
      const filePath = path.join(process.cwd(), alert.snapshot_url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log("🗑️ Deleted snapshot:", filePath);
        } catch (err) {
          console.error("❌ Error deleting snapshot:", err);
        }
      }
    }

    const evidences = await AlertEvidence.findAll({
      where: { alertID: id },
    });

    if (evidences && evidences.length > 0) {
      evidences.forEach((evidence) => {
        if (evidence.imageUrl) {
          const evidencePath = path.join(process.cwd(), evidence.imageUrl);
          if (fs.existsSync(evidencePath)) {
            try {
              fs.unlinkSync(evidencePath);
              console.log("🗑️ Deleted evidence image:", evidencePath);
            } catch (err) {
              console.error("❌ Error deleting evidence image:", err);
            }
          }
        }
      });

      await AlertEvidence.destroy({
        where: { alertID: id },
      });
    }

    await alert.destroy();

    res.json({ ok: true, message: "Alert deleted successfully" });
  } catch (e) {
    console.error("❌ ERROR in deleteAlert:", e);
    res.status(500).json({ message: "Server error", error: e.toString() });
  }
};
