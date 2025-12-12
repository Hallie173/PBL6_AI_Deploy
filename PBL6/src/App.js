import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import AlertHistory from "./Pages/AlertHistory";
import AlertDetail from "./Pages/AlertDetail";
import EditProfile from "./Pages/EditProfile";
import MainLayout from "./components/MainLayout";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import { DetectionProvider } from "./context/DetectionContext";
import ResetPassword from "./Pages/ResetPassword";

function App() {
  return (
    <DetectionProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                <Homepage />
              </MainLayout>
            }
          />
          <Route
            path="/update-profile"
            element={
              <MainLayout>
                <EditProfile />
              </MainLayout>
            }
          />
          <Route
            path="/alert-history"
            element={
              <MainLayout>
                <AlertHistory />
              </MainLayout>
            }
          />
          <Route
            path="/alert-detail/:id"
            element={
              <MainLayout>
                <AlertDetail />
              </MainLayout>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Router>
    </DetectionProvider>
  );
}

export default App;
