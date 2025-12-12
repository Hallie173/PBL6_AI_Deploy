import React, { useEffect, useState } from "react";
import "./Sidebar.scss";
import defaultAvatar from "../assets/images/avatar.png";
import { NavLink, useLocation } from "react-router-dom";
import Footer from "./Footer";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(defaultAvatar);
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path ? "active" : "";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("user");

    if (token && userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);

        if (parsedUser.avatar) {
          setAvatar(parsedUser.avatar);
        }
      } catch (err) {
        console.error("Error parsing user info:", err);
      }
    }
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar-profile">
        <img src={avatar} alt="User Avatar" className="avatar" />
        <h3 className="username">
          {user ? user.displayName || "Guest User" : "Guest User"}
        </h3>
      </div>

      {user ? (
        <>
          <ul className="sidebar-menu">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/update-profile"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/alert-history"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                History
              </NavLink>
            </li>
          </ul>
        </>
      ) : (
        <p className="not-logged-in">Please login for information!</p>
      )}

      <div className="sidebar-footer">
        <Footer />
      </div>
    </div>
  );
};

export default Sidebar;
