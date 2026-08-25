import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/public/Home";
import HowItWorks from "./pages/public/HowItWorks";
import Issues from "./pages/public/Issues";
import About from "./pages/public/About";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import CitizenDashboard from "./pages/citizen/Dashboard";
import ReportIssue from "./pages/citizen/ReportIssue";
import MyComplaints from "./pages/citizen/MyComplaints";
import CitizenComplaintDetail from "./pages/citizen/ComplaintDetail";

import OfficerDashboard from "./pages/officer/Dashboard";
import AssignedComplaints from "./pages/officer/AssignedComplaints";
import NearbyIssues from "./pages/officer/NearbyIssues";
import MapView from "./pages/officer/MapView";
import OfficerComplaintDetail from "./pages/officer/ComplaintDetail";

import AdminDashboard from "./pages/admin/Dashboard";
import AllComplaints from "./pages/admin/AllComplaints";
import AdminComplaintDetail from "./pages/admin/ComplaintDetail";
import ManageOfficers from "./pages/admin/ManageOfficers";
import Analytics from "./pages/admin/Analytics";

import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/issues" element={<Issues />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Citizen */}
      <Route
        path="/citizen/dashboard"
        element={
          <ProtectedRoute role="citizen">
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/report"
        element={
          <ProtectedRoute role="citizen">
            <ReportIssue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/complaints"
        element={
          <ProtectedRoute role="citizen">
            <MyComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/complaints/:id"
        element={
          <ProtectedRoute role="citizen">
            <CitizenComplaintDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/notifications"
        element={
          <ProtectedRoute role="citizen">
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/profile"
        element={
          <ProtectedRoute role="citizen">
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Officer (also allow admin to use officer dashboards) */}
      <Route
        path="/officer/dashboard"
        element={
          <ProtectedRoute role="officer">
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/assigned"
        element={
          <ProtectedRoute role="officer">
            <AssignedComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/nearby"
        element={
          <ProtectedRoute role="officer">
            <NearbyIssues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/map"
        element={
          <ProtectedRoute role="officer">
            <MapView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/complaints/:id"
        element={
          <ProtectedRoute role="officer">
            <OfficerComplaintDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/notifications"
        element={
          <ProtectedRoute role="officer">
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/profile"
        element={
          <ProtectedRoute role="officer">
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute role="admin">
            <AllComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints/:id"
        element={
          <ProtectedRoute role="admin">
            <AdminComplaintDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/officers"
        element={
          <ProtectedRoute role="admin">
            <ManageOfficers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute role="admin">
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute role="admin">
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute role="admin">
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
