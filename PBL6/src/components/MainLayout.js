import React from "react";
import "./MainLayout.scss";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <Header />
      <div className="main-content-area">
        <Sidebar />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
