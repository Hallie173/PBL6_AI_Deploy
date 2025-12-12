import React, { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";

export const DetectionContext = createContext();

const FLASK_API_URL = "https://sip-in-ease.duckdns.org/api/detect_frame";
const NODE_API_URL = "https://sip-in-ease.duckdns.org/api/alerts/evidence";
const INTERVAL_MS = 500;
const CAPTURE_DURATION_SEC = 10;
const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

export const DetectionProvider = ({ children }) => {
  // State toàn cục
  const [alertLogs, setAlertLogs] = useState([]);
  const [detections, setDetections] = useState([]);
  const [stream, setStream] = useState(null); // Lưu stream camera để chia sẻ
  const [isRecording, setIsRecording] = useState(false);

  // Refs xử lý ngầm
  const hiddenVideoRef = useRef(document.createElement("video")); // Video ẩn để xử lý
  const hiddenCanvasRef = useRef(document.createElement("canvas")); // Canvas ẩn
  const isLockedRef = useRef(false);

  useEffect(() => {
    hiddenVideoRef.current.muted = true;
    hiddenVideoRef.current.playsInline = true;
    hiddenVideoRef.current.autoplay = true;
  }, []);

  // 1. Âm thanh báo động
  const playAlertSound = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const beep = (startTime) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = 880;
      osc.start(startTime);
      osc.stop(startTime + 0.1);
      gain.gain.setValueAtTime(1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
    };
    const now = ctx.currentTime;
    beep(now);
    beep(now + 0.2);
    beep(now + 0.4);
    beep(now + 1.0);
    beep(now + 1.2);
    beep(now + 1.4);
  };

  // 2. Hàm chụp bằng chứng
  const captureEvidenceSequence = async (triggerType, userID) => {
    setIsRecording(true);
    playAlertSound();

    const alertId = Date.now();
    const newLog = {
      id: alertId,
      time: new Date().toLocaleTimeString("vi-VN"),
      message: "Saving evidence...",
      status: "recording",
      type: triggerType,
    };
    setAlertLogs((prev) => [newLog, ...prev]);

    const sessionID = alertId;

    for (let i = 0; i < CAPTURE_DURATION_SEC; i++) {
      if (!hiddenVideoRef.current) break;

      try {
        const canvas = hiddenCanvasRef.current;
        const ctx = canvas.getContext("2d");
        // Vẽ từ video ẩn
        ctx.drawImage(
          hiddenVideoRef.current,
          0,
          0,
          canvas.width,
          canvas.height
        );
        const snapshotData = canvas.toDataURL("image/jpeg", 0.7);

        await axios.post(NODE_API_URL, {
          userID,
          image: snapshotData,
          alertType: triggerType,
          sessionID,
          sequenceIndex: i + 1,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Evidence error:", error);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setAlertLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.id === alertId
          ? { ...log, message: "Evidence saved!", status: "done" }
          : log
      )
    );
    setIsRecording(false);
  };

  // 3. Khởi tạo Camera (Chạy 1 lần khi App mở)
  useEffect(() => {
    let currentStream = null;
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
        });

        currentStream = mediaStream;
        setStream(mediaStream);

        if (hiddenVideoRef.current) {
          hiddenVideoRef.current.srcObject = mediaStream;

          hiddenVideoRef.current.onloadedmetadata = () => {
            hiddenCanvasRef.current.width = hiddenVideoRef.current.videoWidth;
            hiddenCanvasRef.current.height = hiddenVideoRef.current.videoHeight;

            // --- FIX ERROR: Xử lý Promise của play() ---
            const playPromise = hiddenVideoRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                // Chỉ bỏ qua lỗi AbortError (do load request mới làm gián đoạn)
                if (error.name !== "AbortError") {
                  console.error("Autoplay failed:", error);
                }
              });
            }
          };
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      if (hiddenVideoRef.current) {
        hiddenVideoRef.current.srcObject = null;
      }
    };
  }, []);

  // 4. Vòng lặp AI (Chạy liên tục bất kể đang ở trang nào)
  useEffect(() => {
    const interval = setInterval(async () => {
      const video = hiddenVideoRef.current;
      const canvas = hiddenCanvasRef.current;

      // Chỉ chạy khi video ẩn đã sẵn sàng
      if (
        !video ||
        !canvas ||
        video.readyState !== 4 ||
        video.paused ||
        video.ended
      )
        return;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg", 0.5);

      let currentUserID = null;
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          currentUserID = JSON.parse(userStr).userID;
        } catch {
          currentUserID = userStr;
        }
      }
      if (!currentUserID) return;

      try {
        const response = await axios.post(FLASK_API_URL, {
          image: imageData,
          userID: currentUserID,
        });

        // Cập nhật detections cho UI
        setDetections(response.data.detections || []);

        // Logic Alert
        const serverTrigger = response.data.alert_trigger;
        if (serverTrigger && !isLockedRef.current) {
          console.log("🚨 BACKGROUND ALERT:", serverTrigger);
          isLockedRef.current = true;
          captureEvidenceSequence(serverTrigger, currentUserID).finally(() => {
            isLockedRef.current = false;
          });
        }
      } catch (e) {
        // console.error("AI API Error", e); // Comment bớt cho đỡ rác console
      }
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, []); // Empty dependency array -> Chạy mãi mãi

  return (
    <DetectionContext.Provider
      value={{
        stream, // Để CameraFeed hiển thị
        detections, // Để vẽ box
        alertLogs, // Để hiển thị log bên sidebar
        isRecording,
      }}
    >
      {children}
    </DetectionContext.Provider>
  );
};
