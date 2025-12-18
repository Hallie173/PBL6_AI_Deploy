import { Alert, AlertEvidence } from "../models/index.js";
import fs from "fs";

export const receiveEvidence = async (req, res) => {
  try {
    const { userID, alertType, sessionID, sequenceIndex, timestamp, image } =
      req.body;

    if (!userID || !alertType || !sessionID || !image) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // 1️⃣ Kiểm tra alert đã tồn tại cho sessionID chưa
    let alert = await Alert.findOne({
      where: { userID, content: sessionID },
    });

    // 2️⃣ Nếu chưa → tạo alert mới
    if (!alert) {
      alert = await Alert.create({
        userID,
        alert_type: alertType.toLowerCase(),
        content: sessionID,
        snapshot_url: null,
        status: "pending",
      });
      console.log("🆕 CREATED ALERT", alert.alertID);
    }

    // 3️⃣ Lưu ảnh vào uploads
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
    const fileName = `uploads/evidence_${alert.alertID}_${sequenceIndex}.jpg`;

    fs.writeFileSync(fileName, base64Data, "base64");

    // 4️⃣ Lưu vào bảng AlertEvidence
    await AlertEvidence.create({
      alertID: alert.alertID,
      sessionID,
      sequenceIndex,
      imageUrl: fileName,
      timestamp: new Date(timestamp),
    });

    console.log(`📸 Lưu ảnh sequence ${sequenceIndex} OK`);

    return res.json({
      ok: true,
      alertID: alert.alertID,
      saved: fileName,
    });
  } catch (err) {
    console.error("❌ receiveEvidence ERROR:", err);
    res.status(500).json({ error: err.toString() });
  }
};
