import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// ✅ Added ShieldPlus and ShieldCheck to imports
import { 
  Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, 
  CheckCircle2, AlertTriangle, Crown, Fingerprint, User, 
  Phone, UserCheck, ChevronLeft, Key, ShieldCheck, ShieldPlus 
} from "lucide-react";

export default function AdminSignup() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    phone: "",
    role: "",
    adminCode: "",
    password: "",
    confirmPassword: ""
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name required";
      if (!formData.email.trim()) newErrors.email = "Email required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
      if (!formData.phone.trim()) newErrors.phone = "Phone number required";
      if (!formData.role.trim()) newErrors.role = "Role selection required";
    }
    
    if (stepNumber === 2) {
      if (!formData.adminCode.trim()) newErrors.adminCode = "Admin authorization code required";
      if (formData.adminCode.length < 6) newErrors.adminCode = "Invalid authorization code";
    }
    
    if (stepNumber === 3) {
      if (!formData.password) newErrors.password = "Password required";
      if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = "Password must contain uppercase, lowercase, and number";
      }
      if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm password";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
    if (status.message) setStatus({ type: "", message: "" });
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        adminCode: formData.adminCode,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`.trim()
      };

      const res = await fetch("http://localhost:3000/api/auth/admin/signup", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Admin-Auth": "true"
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus({ type: "success", message: "Admin account created successfully. Redirecting to login..." });
        setTimeout(() => navigate("/admin/login"), 2000);
      } else {
        setStatus({ type: "error", message: data.message || "Admin registration failed." });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Secure connection failed. Server unreachable." });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-2">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step >= num 
                  ? "bg-red-500 text-white" 
                  : "bg-slate-700 text-slate-400"
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: step === num ? 1.1 : 1 }}
            >
              {step > num ? <CheckCircle2 size={16} /> : num}
            </motion.div>
            {num < 3 && (
              <div className={`w-8 h-0.5 mx-2 transition-colors ${
                step > num ? "bg-red-500" : "bg-slate-700"
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                  First Name
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full bg-slate-700/50 dark:bg-slate-800/50 border rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                      errors.firstName ? "border-red-500" : "border-slate-600"
                    }`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && <p className="text-red-400 text-xs">{errors.firstName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                  Last Name
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full bg-slate-700/50 dark:bg-slate-800/50 border rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                      errors.lastName ? "border-red-500" : "border-slate-600"
                    }`}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && <p className="text-red-400 text-xs">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-700/50 dark:bg-slate-800/50 border rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                    errors.email ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="admin@organization.com"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                Phone Number
              </label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full bg-slate-700/50 dark:bg-slate-800/50 border rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                    errors.phone ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                Role/Permission
              </label>
              <div className="relative group">
                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full bg-slate-700/50 dark:bg-slate-800/50 border rounded-xl py-3 pl-10 pr-8 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all appearance-none cursor-pointer ${
                    errors.role ? "border-red-500" : "border-slate-600"
                  }`}
                >
                  <option value="">Select a role</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="manager">Manager</option>
                  <option value="analyst">Analyst</option>
                  <option value="auditor">Auditor</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.role && <p className="text-red-400 text-xs">{errors.role}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Key className="text-red-400" size={20} />
                <h3 className="font-semibold text-red-400">Admin Authorization Required</h3>
              </div>
              <p className="text-sm text-slate-400">
                Enter the admin authorization code provided by your system administrator. 
                This code verifies your eligibility for admin privileges.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                Authorization Code
              </label>
              <div className="relative group">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                <input
                  type="text"
                  name="adminCode"
                  value={formData.adminCode}
                  onChange={handleChange}
                  className={`w-full bg-slate-700/50 dark:bg-slate-800/50 border rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono ${
                    errors.adminCode ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="ADMIN-XXXXX"
                />
              </div>
              {errors.adminCode && <p className="text-red-400 text-xs">{errors.adminCode}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="text-blue-400" size={20} />
                <h3 className="font-semibold text-blue-400">Security Requirements</h3>
              </div>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Contains uppercase and lowercase letters</li>
                <li>• Includes at least one number</li>
                <li>• Strong password recommended</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                Admin Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-slate-700/50 dark:bg-slate-800/50 border rounded-xl py-3 pl-10 pr-12 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                    errors.password ? "border-red-500" : "border-slate-600"
                  }`}
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
              {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-slate-700/50 dark:bg-slate-800/50 border rounded-xl py-3 pl-10 pr-12 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                    errors.confirmPassword ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword}</p>}
            </div>
          </div>
        );

      default:
        return null;
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
            ADMIN REGISTRATION
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
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 mb-4 ring-2 ring-red-500/20">
                <ShieldPlus size={32} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-100">
                Admin Registration
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                Create your administrator account
              </p>
            </div>

            {/* Step Indicator */}
            {renderStepIndicator()}

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
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-3 font-semibold transition-all duration-200"
                  >
                    Back
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-semibold transition-all duration-200"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-semibold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      "Create Admin Account"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
          
          {/* Footer Area */}
          <div className="bg-slate-800/50 dark:bg-slate-900/50 p-4 text-center border-t border-slate-700 dark:border-slate-800">
            <p className="text-sm text-slate-400">
              Already have admin access?{" "}
              <Link to="/admin/login" className="font-semibold text-red-400 hover:text-red-300 transition-colors">
                Sign In
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
            <ShieldCheck size={10} />
            <span>SECURE ADMIN REGISTRATION</span>
          </div>
        </div>

      </main>
    </div>
  );
}