import React from "react";
import "./Homepage.scss";
import CameraFeed from "../components/CameraFeed";

const Homepage = () => {
  return (
    <div className="homepage">
        <CameraFeed />
    </div>
  );
};

export default Homepage;
