import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AlertDetail.scss";

const SERVER_URL = "https://sip-in-ease.duckdns.org/";
const API_BASE_URL = "https://sip-in-ease.duckdns.org/api/alerts";

const AlertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [lightboxIndex, setLightboxIndex] = useState(null); // null = đóng, number = index ảnh đang mở

  useEffect(() => {
    fetchAlertDetail();
  }, [id]);

  const fetchAlertDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://sip-in-ease.duckdns.org/api/alerts/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.ok) {
        setAlertData(res.data.alert);
      }
    } catch (err) {
      console.error("Load detail error:", err);
      alert("Alert not found or Connection Error!");
      navigate("/history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (alertID) => {
    if (!window.confirm("Do you want to permanently delete this alert?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(`${API_BASE_URL}/${alertID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.ok) {
        setAlerts((prevAlerts) =>
          prevAlerts.filter((alert) => alert.alertID !== alertID)
        );

        alert("Alert deleted!");
      } else {
        alert("Error deleting alert.");
      }

      window.location.href = "/alert-history";
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting the alert.");
    }
  };

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextImage = useCallback(
    (e) => {
      e?.stopPropagation();
      if (alertData?.evidences?.length > 0) {
        setLightboxIndex((prev) => (prev + 1) % alertData.evidences.length);
      }
    },
    [alertData]
  );

  const prevImage = useCallback(
    (e) => {
      e?.stopPropagation();
      if (alertData?.evidences?.length > 0) {
        setLightboxIndex(
          (prev) =>
            (prev - 1 + alertData.evidences.length) % alertData.evidences.length
        );
      }
    },
    [alertData]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, nextImage, prevImage]);

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (!alertData) return null;

  const evidences = alertData.evidences || [];

  return (
    <div className="alert-detail-page">
      <button className="btn-back" onClick={() => navigate(-1)}>
        &larr; Back
      </button>

      <h1 className="page-title">Alert Detail #{alertData.alertID}</h1>

      <div className="info-section">
        <table className="detail-table">
          <tbody>
            <tr>
              <th>Alert type</th>
              <td className={`type-${alertData.alert_type?.toLowerCase()}`}>
                {alertData.alert_type?.toUpperCase()}
              </td>
            </tr>
            <tr>
              <th>Time</th>
              <td>{new Date(alertData.created_at).toLocaleString("vi-VN")}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{alertData.status || "Hoàn tất"}</td>
            </tr>
            <tr>
              <th>Content</th>
              <td>{alertData.content}</td>
            </tr>
          </tbody>
        </table>
        <div className="action-button">
          <button
            className="btn-delete"
            onClick={() => handleDelete(alertData.alertID)}
          >
            Delete
          </button>
        </div>
      </div>

      <h3 className="section-title">
        Evidences captured: ({evidences.length} pictures)
      </h3>
      <div className="evidence-grid">
        {evidences.length > 0 ? (
          evidences.map((img, index) => (
            <div
              key={img.evidenceID}
              className="evidence-item"
              onClick={() => openLightbox(index)}
            >
              <img
                src={`${SERVER_URL}${img.imageUrl}`}
                alt={`Evidence ${index + 1}`}
                loading="lazy"
              />
              <span className="seq-badge">{index + 1}</span>
            </div>
          ))
        ) : (
          <p>No evidences found.</p>
        )}
      </div>

      {lightboxIndex !== null && evidences[lightboxIndex] && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="btn-close" onClick={closeLightbox}>
            &times;
          </button>

          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`${SERVER_URL}${evidences[lightboxIndex].imageUrl}`}
              alt="Full view"
              className="lightbox-image"
            />

            <button className="nav-btn prev" onClick={prevImage}>
              &#10094;
            </button>
            <button className="nav-btn next" onClick={nextImage}>
              &#10095;
            </button>

            <div className="lightbox-caption">
              Picture {lightboxIndex + 1} / {evidences.length} -
              {new Date(
                evidences[lightboxIndex].timestamp || Date.now()
              ).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertDetail;
