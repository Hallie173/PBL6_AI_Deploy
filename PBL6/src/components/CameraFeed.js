import React, { useRef, useEffect, useContext, useState } from "react";
import { DetectionContext } from "../context/DetectionContext"; // Nhớ import đúng đường dẫn
import "./CameraFeed.scss";

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

export default function CameraFeed() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Lấy dữ liệu từ Context
  const { stream, detections, alertLogs } = useContext(DetectionContext);

  const [videoDimensions, setVideoDimensions] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });

  // Gán stream từ Context vào thẻ video hiển thị
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // Khi metadata load xong thì set kích thước để vẽ box cho chuẩn
      videoRef.current.onloadedmetadata = () => {
        setVideoDimensions({
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        });
      };
    }
  }, [stream]);

  const drawBoxes = () => {
    if (!detections.length || !containerRef.current) return null;
    const displayWidth = containerRef.current.offsetWidth;
    const displayHeight = containerRef.current.offsetHeight;

    if (videoDimensions.width === 0) return null;

    const scaleX = displayWidth / videoDimensions.width;
    const scaleY = displayHeight / videoDimensions.height;

    return detections.map((det, i) => {
      const [x1, y1, x2, y2] = det.box;
      const label = det.label.toUpperCase();
      const classMap = {
        FIRE: "fire-box",
        SMOKE: "smoke-box",
        FALL: "fall-box",
      };

      return (
        <div
          key={i}
          className={`bounding-box ${classMap[label] || "unknown-box"}`}
          style={{
            left: `${x1 * scaleX}px`,
            top: `${y1 * scaleY}px`,
            width: `${(x2 - x1) * scaleX}px`,
            height: `${(y2 - y1) * scaleY}px`,
          }}
        >
          <span className="box-label">
            {label} ({det.confidence})
          </span>
        </div>
      );
    });
  };

  return (
    <div className="camera-layout">
      <div className="camera-feed-wrapper">
        <div
          ref={containerRef}
          className="camera-feed-container"
          style={{
            width: "100%",
            maxWidth: `${DEFAULT_WIDTH}px`,
            aspectRatio: `${DEFAULT_WIDTH}/${DEFAULT_HEIGHT}`,
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="video-stream"
            style={{ width: "100%", height: "100%" }}
          />
          {drawBoxes()}
        </div>
      </div>

      <div className="info-sidebar">
        <h3 className="sidebar-title">SECURITY MONITOR</h3>
        <div className="status-section">
          {detections.length ? (
            <p className="status-text status-active">
              ✅ Detected {detections.length} objects.
            </p>
          ) : (
            <p className="status-text status-inactive">
              ⏳ Monitoring in background...
            </p>
          )}
        </div>
        <div className="alert-list-container">
          <ul className="alert-list">
            {alertLogs.map((log) => (
              <li key={log.id} className="alert-item">
                <span className="alert-time">[{log.time}]</span>
                <span
                  className={
                    log.status === "recording"
                      ? "dot-indicator dot-recording"
                      : "dot-indicator"
                  }
                ></span>
                <span
                  className={`alert-msg ${
                    log.status === "done" ? "alert-msg-done" : ""
                  }`}
                >
                  {log.message}
                </span>
              </li>
            ))}
            {alertLogs.length === 0 && (
              <li className="alert-empty">No alert recorded.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
