import axios from "axios";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:5000/api/detect_frame";

export const detectFrame = async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ message: "Missing image data." });
  }

  try {
    const aiResponse = await axios.post(
      AI_SERVICE_URL,
      { image },
      { timeout: 2000 } // prevent infinite waiting
    );

    if (!aiResponse.data || typeof aiResponse.data !== "object") {
      return res
        .status(500)
        .json({ message: "Invalid response from AI Service." });
    }

    return res.status(200).json(aiResponse.data);
  } catch (error) {
    console.error("Error communicating with AI Service:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({ message: "AI Service Timeout." });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.error || "AI Service failure.",
      });
    }

    return res.status(503).json({
      message: "Failed to connect to AI Detection Server.",
    });
  }
};
