import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle, ShieldPlus, ChevronLeft, Phone } from "lucide-react";
import CryptoJS from 'crypto-js'; // Ensure you have: npm install crypto-js

// --- HELPER FUNCTIONS (Moved here to prevent import errors) ---

const generateUserId = () => {
  // Generates a random ID like "user_x9s8d7f"
  return 'user_' + Math.random().toString(36).substring(2, 9);
};

const generateEncryptedAccountId = ({ email, firstName, lastName }) => {
  const rawString = `${email}-${firstName}-${lastName}-${Date.now()}`;
  try {
    // Try using secure hash
    return `ACC-${CryptoJS.MD5(rawString).toString().substring(0, 12).toUpperCase()}`;
  } catch (e) {
    // Fallback if crypto-js is missing/fails
    return `ACC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }
};

// -------------------------------------------------------------

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    phone: "",
    password: "" 
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.message) setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    // Combine names for backend compatibility
    const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone ? formData.phone.trim() : "",
        password: formData.password.trim(),
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`
    };
    console.log("Sending Signup Payload:", payload);

    try {
      const res = await fetch("http://127.0.0.1:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // Use backend ID if available to ensure consistency with login
        const userId = data._id || (data.user && data.user._id) || generateUserId();
        const encryptedAccountId = generateEncryptedAccountId(formData);
        
        // Store user ID and email in localStorage
        localStorage.setItem('userId', userId);
        localStorage.setItem('accountId', encryptedAccountId);
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userName', payload.name); // Store full name for dashboard
        
        // Initialize user profile data
        const profileData = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: formData.role || 'user',
          bio: '',
          profilePicture: null,
          userId: userId,
          accountId: encryptedAccountId
        };
        
        // Save profile data
        const profileKey = `userProfile_${formData.email}`;
        localStorage.setItem(profileKey, JSON.stringify(profileData));
        
        setStatus({ type: "success", message: "Clearance Granted. Redirecting to Login..." });
        
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setStatus({ type: "error", message: data.message || "Registration Denied." });
        setLoading(false); 
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Uplink Failed. Server Unreachable." });
      setLoading(false); 
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30">
      
      {/* --- Background Effects --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>
      </div>

      <main className="w-full max-w-md px-6 relative z-10 my-10">
        
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
          <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500"></div>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-4 ring-1 ring-purple-100 dark:ring-purple-500/20">
                <ShieldPlus size={24} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Request Clearance
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Create your identity profile. Additional details can be configured later.
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
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                      First Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      placeholder="John"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                      Last Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                    Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    placeholder="name@organization.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                    Phone Number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                    Set Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-slate-900 dark:bg-purple-600 text-white rounded-xl py-3.5 font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Registering...</span>
                    </>
                  ) : (
                    <>
                        <span>Submit Application</span>
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
               Already authorized?{" "}
               <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400 transition-colors">
                   Access Login
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