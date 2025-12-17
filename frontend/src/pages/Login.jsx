import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { setToken, authenticateUser } from "../lib/auth";
import CryptoJS from 'crypto-js';

// --- HELPER FUNCTION (Inlined to prevent import errors) ---
const generateEncryptedAccountId = ({ email, firstName, lastName }) => {
  const rawString = `${email}-${firstName}-${lastName}-${Date.now()}`;
  try {
    return `ACC-${CryptoJS.MD5(rawString).toString().substring(0, 12).toUpperCase()}`;
  } catch (e) {
    return `ACC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }
};
// ---------------------------------------------------------

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.message) setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await authenticateUser(
        formData.email.trim().toLowerCase(),
        formData.password.trim()
      );
      
      if (!response.success) {
        throw new Error(response.error || "Login failed");
      }

      console.log("Login Success Response:", response);

      // Handle successful login
      // setToken is already handled inside authenticateUser, but we can ensure it here if needed
      if (response.token) setToken(response.token);
      
      // Save user ID to localStorage
      const userId = response.user?.id || response.user?._id || response.user?.accId;
      
      if (!userId) {
        console.error("CRITICAL: User ID missing in response", response);
        throw new Error("Login succeeded but User ID is missing. Check backend response.");
      }
      
      localStorage.setItem('userId', userId);
      console.log("User ID saved:", userId);

      // Clear any existing profile data
      localStorage.removeItem('userProfile');
      
      // Generate encrypted account ID
      const encryptedAccountId = generateEncryptedAccountId({
        email: response.user?.email || formData.email,
        firstName: response.user?.firstName || (response.user?.name?.split(' ')[0]) || '',
        lastName: response.user?.lastName || (response.user?.name?.split(' ')[1]) || ''
      });
      localStorage.setItem('accountId', encryptedAccountId);
      
      // Store user email
      const userEmail = response.user?.email || formData.email;
      localStorage.setItem('userEmail', userEmail);
      
      // Update profile data
      const profileKey = `userProfile_${userEmail}`;
      
      // Construct profile data
      const profileData = {
        email: userEmail,
        firstName: response.user?.firstName || response.firstName || (response.user?.name?.split(' ')[0]) || '',
        lastName: response.user?.lastName || response.lastName || (response.user?.name?.split(' ')[1]) || '',
        phone: response.user?.phone || response.phone || '',
        role: response.user?.role || response.role || 'user',
        profilePicture: response.user?.profilePicture || response.profilePicture || null,
        location: response.user?.location || response.location || '',
        department: response.user?.department || response.department || '',
        bio: response.user?.bio || response.bio || '',
        employeeId: response.user?.employeeId || response.employeeId || '',
        clearance: response.user?.clearance || response.clearance || '',
        twoFactorEnabled: response.user?.twoFactorEnabled || false,
        loginAlertsEnabled: response.user?.loginAlertsEnabled !== false,
        lastPasswordChange: response.user?.lastPasswordChange || null,
        createdAt: response.user?.createdAt || null,
        isVerified: response.user?.isVerified || false,
        _id: userId,
        userId: userId,
        accountId: encryptedAccountId
      };
      
      localStorage.setItem(profileKey, JSON.stringify(profileData));
      
      setStatus({ type: "success", message: "Credentials Verified. Redirecting..." });
      setTimeout(() => navigate("/dashboard"), 1000);
      
    } catch (error) {
      console.error("Login error:", error);
      setStatus({ 
        type: "error", 
        message: error.message || "Login failed. Please check your credentials and try again." 
      });
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30">
      
      {/* --- Background Effects (Matches Landing) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>
      </div>

      <main className="w-full max-w-md px-6 relative z-10">
        
        {/* Back Link */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
        >
            <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                <ChevronLeft size={16} className="mr-1" /> Return to Landing
            </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Top Decorative Line */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4 ring-1 ring-indigo-100 dark:ring-indigo-500/20">
                <ShieldCheck size={24} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Identity Verification
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Enter your secure credentials to access the dashboard.
              </p>
            </div>

            {/* Status Messages */}
            <AnimatePresence mode='wait'>
                {status.message && (
                <motion.div 
                    initial={{ opacity: 0, height: 0, mb: 0 }}
                    animate={{ opacity: 1, height: 'auto', mb: 16 }}
                    exit={{ opacity: 0, height: 0, mb: 0 }}
                    className={`rounded-lg px-4 py-3 text-sm flex items-start gap-3 border ${
                        status.type === "success" 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400" 
                        : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400"
                    }`}
                >
                    {status.type === "success" ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                    <div>{status.message}</div>
                </motion.div>
                )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                    Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="name@organization.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Password
                    </label>
                    <a href="#" className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium">Forgot?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-slate-900 dark:bg-indigo-600 text-white rounded-xl py-3.5 font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                        <span>Initiate Session</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>

            </form>
          </div>
          
          {/* Footer Area */}
          <div className="bg-slate-50/50 dark:bg-slate-950/50 p-4 text-center border-t border-slate-100 dark:border-slate-800">
             <p className="text-sm text-slate-500 dark:text-slate-400">
                New to the system?{" "}
                <Link to="/sign-up" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
                    Request Clearance
                </Link>
             </p>
          </div>

        </motion.div>
        
        {/* Security Footer */}
        <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 dark:text-slate-500 opacity-60">
                <Lock size={10} />
                <span>256-BIT ENCRYPTION ACTIVE</span>
            </div>
        </div>

      </main>
    </div>
  );
}