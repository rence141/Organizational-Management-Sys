// App-level router and layout shell - DEBUG VERSION WITHOUT THEME PROVIDER
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing.jsx";
import BasicTest from "./pages/BasicTest";
import TestMinimal from "./pages/TestMinimal";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import MyOrganization from "./pages/MyOrganization";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      {/* Global navigation */}
      <Navbar />
      
      {/* Center content; adjust max width for comfortable reading */}
      <div className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/test" element={<BasicTest />} />
          <Route path="/minimal" element={<TestMinimal />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-organization"
            element={
              <ProtectedRoute>
                <MyOrganization />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
