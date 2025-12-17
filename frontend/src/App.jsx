import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Landing from "./pages/landing.jsx";
import Login from "./pages/login.jsx";
import SignUp from "./pages/sign-up.jsx";
import BasicTest from "./pages/BasicTest";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import MyOrganization from "./pages/MyOrganization"; // Ensure this matches your file name
import Profile from "./pages/Profile";
import Security from "./pages/Security";
import Organizations from "./pages/Organizations";
import FindOrganization from "./pages/FindOrganization";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSignup from "./pages/admin/AdminSignup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCharts from "./pages/admin/AdminCharts";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Navbar /><Landing /></>} />
          <Route path="/login" element={<><Navbar /><Login /></>} />
          <Route path="/sign-up" element={<><Navbar /><SignUp /></>} />
          <Route path="/test" element={<><Navbar /><BasicTest /></>} />
          
          {/* Admin Routes - No Navbar */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/charts" element={<AdminProtectedRoute><AdminCharts /></AdminProtectedRoute>} />
          
          {/* User Routes - With Navbar */}
          <Route path="/*" element={
            <>
              <Navbar />
              <div className="max-w-6xl mx-auto p-4">
                <Routes>
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
                  
                  {/* Organization Management Routes */}
                  <Route path="/organizations" element={<ProtectedRoute><Organizations /></ProtectedRoute>} />
                  <Route path="/organizations/find" element={<ProtectedRoute><FindOrganization /></ProtectedRoute>} />
                  
                  {/* ✅ FIXED: Added Dynamic Route for "Manage" Button */}
                  {/* This catches URLs like /organization/org_123 */}
                  <Route path="/organization/:id" element={<ProtectedRoute><MyOrganization /></ProtectedRoute>} />
                  
                  {/* Keep this if you use it, or redirect it */}
                  <Route path="/my-organization" element={<ProtectedRoute><MyOrganization /></ProtectedRoute>} />
                </Routes>
              </div>
            </>
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}