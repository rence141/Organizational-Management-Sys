import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      // 1. Check Local Storage (Client-side check)
      const token = localStorage.getItem("token");
      const isAdmin = localStorage.getItem("isAdmin");

      // If no token exists at all, redirect to login
      if (!token || isAdmin !== "true") {
        navigate("/admin/login");
        return;
      }

      // ⚠️ BYPASS: We are skipping the server verification for now
      // This allows you to access the dashboard even if the backend is offline.
      
      /* try {
        const res = await fetch("http://localhost:3000/api/auth/verify-admin", {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "X-Admin-Auth": "true" 
          }
        });
        if (!res.ok) throw new Error("Not authorized");
      } catch (err) {
        // If server is down, we normally kick user out. 
        // Commenting this out to allow "Offline Mode"
        // navigate("/admin/login"); 
      }
      */

      setIsLoading(false);
    };

    verifyAdmin();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-sm">Verifying Access...</p>
        </div>
      </div>
    );
  }

  return children;
}