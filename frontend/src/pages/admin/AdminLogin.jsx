import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, ArrowRight, Loader2, Crown, Fingerprint } from "lucide-react";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Check for remembered admin on component mount
  useEffect(() => {
    const rememberedAdmin = localStorage.getItem("rememberAdmin");
    const rememberedEmail = localStorage.getItem("rememberedAdminEmail");
    const rememberedTimestamp = localStorage.getItem("rememberedAdminTimestamp");
    
    if (rememberedAdmin === "true" && rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
      
      // Check if remembered session is older than 30 days
      if (rememberedTimestamp) {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        if (parseInt(rememberedTimestamp) < thirtyDaysAgo) {
          handleForgetDevice();
        }
      }
    }
  }, []);

  const handleForgetDevice = () => {
    localStorage.removeItem("rememberAdmin");
    localStorage.removeItem("rememberedAdminEmail");
    localStorage.removeItem("rememberedAdminTimestamp");
    setFormData(prev => ({ ...prev, email: "", password: "" }));
    setRememberMe(false);
    setStatus({ type: "success", message: "Device forgotten. You will need to login again." });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.message) setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    // --- REAL AUTHENTICATION ---
    try {
      const res = await fetch("http://localhost:3000/api/auth/admin/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Admin-Auth": "true"
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // Save admin credentials
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("userRole", data.user?.role || "Super Admin");

        // Handle "Remember Me"
        if (rememberMe) {
          localStorage.setItem("rememberAdmin", "true");
          localStorage.setItem("rememberedAdminEmail", formData.email);
          localStorage.setItem("rememberedAdminTimestamp", Date.now().toString());
        } else {
          localStorage.removeItem("rememberAdmin");
          localStorage.removeItem("rememberedAdminEmail");
          localStorage.removeItem("rememberedAdminTimestamp");
        }

        setStatus({ type: "success", message: "Admin credentials verified. Establishing uplink..." });
        
        // Redirect
        setTimeout(() => navigate("/admin/dashboard"), 1500);

      } else {
        setStatus({ type: "error", message: data.message || "Access Denied: Invalid credentials." });
        
        // Clear remembered data on failed login
        if (!rememberMe) {
          localStorage.removeItem("rememberAdmin");
          localStorage.removeItem("rememberedAdminEmail");
          localStorage.removeItem("rememberedAdminTimestamp");
        }
      }
    } catch (err) {
      setStatus({ type: "error", message: "Secure connection failed. Server unreachable." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-900 dark:bg-slate-950 text-slate-100 dark:text-slate-100 selection:bg-red-500/30">
      
      {/* --- Background Effects --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff000012_1px,transparent_1px),linear-gradient(to_bottom,#ff000012_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>
      </div>

      <main className="w-full max-w-md px-6 relative z-10 my-10">
        
        {/* Admin Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-sm font-semibold backdrop-blur-sm">
            <Crown size={16} />
            ADMIN PORTAL
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-slate-800/70 dark:bg-slate-900/60 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/10 overflow-hidden"
        >
          {/* Top Decorative Line */}
          <div className="h-1 w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 mb-4 ring-2 ring-red-500/20">
                <Shield size={32} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-100">
                Admin Access
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                Authenticate with elevated privileges
              </p>
            </div>

            {/* Security Notice */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3"
            >
              <Fingerprint size={20} className="text-red-400" />
              <div className="text-xs text-red-400">
                <strong>Security Notice:</strong> This portal is monitored. Unauthorized access will be logged.
              </div>
            </motion.div>

            {/* Status Messages */}
            <AnimatePresence mode='wait'>
              {status.message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, mb: 0 }}
                  animate={{ opacity: 1, height: 'auto', mb: 16 }}
                  exit={{ opacity: 0, height: 0, mb: 0 }}
                  className={`rounded-lg px-4 py-3 text-sm flex items-start gap-3 border ${
                    status.type === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}
                >
                  {status.type === "success" ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
                  <div>{status.message}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                  Admin Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700/50 dark:bg-slate-800/50 border border-slate-600 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    placeholder="admin@organization.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                  Security Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700/50 dark:bg-slate-800/50 border border-slate-600 dark:border-slate-700 rounded-xl py-3 pl-10 pr-12 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500 focus:ring-2 accent-red-500"
                    />
                    <span className="text-sm text-slate-400">Remember this device</span>
                  </label>
                  
                  {rememberMe && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full"
                    >
                      <Fingerprint size={12} className="text-green-400" />
                      <span className="text-xs text-green-400 font-medium">Device saved</span>
                    </motion.div>
                  )}
                </div>
                
                {rememberMe && (
                  <button
                    type="button"
                    onClick={handleForgetDevice}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Forget device
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-red-600 hover:bg-red-700 text-white rounded-xl py-3.5 font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group mt-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Access Admin Panel</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>

            </form>
          </div>
          
          {/* Footer Area */}
          <div className="bg-slate-800/50 dark:bg-slate-900/50 p-4 text-center border-t border-slate-700 dark:border-slate-800">
            <p className="text-sm text-slate-400">
              Need admin access?{" "}
              <Link to="/admin/signup" className="font-semibold text-red-400 hover:text-red-300 transition-colors">
                Request Credentials
              </Link>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              <Link to="/login" className="text-slate-500 hover:text-slate-400 transition-colors">
                ← Back to User Login
              </Link>
            </p>
          </div>

        </motion.div>
        
        {/* Security Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 opacity-60">
            <Shield size={10} />
            <span>ADMIN SECURE CONNECTION</span>
          </div>
        </div>

      </main>
    </div>
  );
}