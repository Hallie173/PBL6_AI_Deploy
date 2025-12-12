import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AlertHistory.scss";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://sip-in-ease.duckdns.org/api/alerts";

function AlertHistory() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]); // Dữ liệu để hiển thị

  // States bộ lọc
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");

  // States phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const alertsPerPage = 20;

  // 1. Fetch dữ liệu khi vào trang
  useEffect(() => {
    fetchAlerts();
  }, []);

  // 2. TỰ ĐỘNG LỌC: Chạy mỗi khi alerts gốc, ngày chọn, hoặc loại chọn thay đổi
  // Đây là phần bạn bị thiếu trước đó
  useEffect(() => {
    applyFilters();
  }, [alerts, selectedDate, selectedType]);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.alerts) {
        // Tạo bản copy [...] trước khi sort để tránh lỗi mutation state
        const sortedAlerts = [...response.data.alerts].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setAlerts(sortedAlerts);
        // Không cần setFilteredAlerts ở đây nữa vì useEffect số 2 sẽ tự làm việc đó
      }
    } catch (err) {
      console.error("Fetch alerts error", err);
    }
  };

  const applyFilters = () => {
    let results = [...alerts];

    // Lọc theo ngày
    if (selectedDate) {
      results = results.filter((alert) => {
        const alertDate = new Date(alert.created_at)
          .toISOString()
          .split("T")[0]; // YYYY-MM-DD
        return alertDate === selectedDate;
      });
    }

    // Lọc theo loại
    if (selectedType !== "ALL") {
      results = results.filter(
        (alert) => alert.alert_type?.toUpperCase() === selectedType
      );
    }

    setFilteredAlerts(results);
    setCurrentPage(1); // Reset về trang 1 khi lọc xong
  };

  // Logic phân trang
  const indexOfLastAlert = currentPage * alertsPerPage;
  const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
  const currentAlerts = filteredAlerts.slice(
    indexOfFirstAlert,
    indexOfLastAlert
  );
  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);

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
        // Chỉ cần cập nhật alerts gốc, useEffect sẽ tự động cập nhật filteredAlerts
        setAlerts((prevAlerts) =>
          prevAlerts.filter((alert) => alert.alertID !== alertID)
        );
        alert("Alert deleted!");
      } else {
        alert("Error deleting alert.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting the alert.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getTitleColor = (type) => {
    const normalizedType = type?.toUpperCase();
    if (normalizedType === "FIRE") return "red";
    if (normalizedType === "FALL") return "#ff9800";
    return "#333";
  };

  return (
    <div className="alert-history">
      <h1 className="title">Lịch sử cảnh báo</h1>

      {/* KHU VỰC BỘ LỌC */}
      <div
        className="filters-container"
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
          justifyContent: "center",
        }}
      >
        <div className="filter-group">
          <label style={{ fontWeight: "bold", marginRight: "5px" }}>
            Ngày:
          </label>
          <input
            type="date"
            className="filter-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div className="filter-group">
          <label style={{ fontWeight: "bold", marginRight: "5px" }}>
            Loại:
          </label>
          <select
            className="filter-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="ALL">Tất cả</option>
            <option value="FIRE">🔥 Fire</option>
            <option value="FALL">⚠️ Fall</option>
          </select>
        </div>

        <button
          onClick={() => {
            setSelectedDate("");
            setSelectedType("ALL");
          }}
          style={{
            padding: "5px 10px",
            cursor: "pointer",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          Reset
        </button>
      </div>

      {/* DANH SÁCH ALERTS */}
      <div className="alert-container">
        {currentAlerts.length > 0 ? (
          currentAlerts.map((alert) => (
            <div key={alert.alertID} className="alert-item">
              <div className="alert-info">
                <h3
                  className="alert-title text-uppercase"
                  style={{ color: getTitleColor(alert.alert_type) }}
                >
                  {(alert.alert_type
                    ? `${alert.alert_type.toUpperCase()} DETECTED`
                    : "ALERT!") + ` - ID: ${alert.alertID}`}
                </h3>
                <p className="alert-time">{formatDate(alert.created_at)}</p>
                <p className="alert-desc">{alert.content}</p>
              </div>

              <div className="alert-actions">
                <Link
                  to={`/alert-detail/${alert.alertID}`}
                  className="btn-detail"
                >
                  View Detail
                </Link>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(alert.alertID)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#666", marginTop: "20px" }}>
            No alerts found matching your filters.
          </p>
        )}
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div
          className="pagination"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "20px",
            paddingBottom: "20px",
          }}
        >
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: "5px 10px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              backgroundColor: currentPage === 1 ? "#eee" : "#fff",
              border: "1px solid #ccc",
            }}
          >
            Prev
          </button>

          <span style={{ lineHeight: "30px", fontWeight: "bold" }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            style={{
              padding: "5px 10px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              backgroundColor: currentPage === totalPages ? "#eee" : "#fff",
              border: "1px solid #ccc",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AlertHistory;
