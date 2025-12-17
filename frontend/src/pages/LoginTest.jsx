import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../lib/auth";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, ShieldAlert } from "lucide-react";

export default function LoginSplitScreen() {
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting login to:", "http://127.0.0.1:5000/api/auth/login");

      const res = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setToken(data.token);
        // Small delay to show success state before redirect
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        setError(data.message || "Invalid email or password.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server unreachable. Please try again later.");
      setIsLoading(false);
    }
  }

  // Direct token bypass for testing
  function handleBypass() {
    const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDAwNDlmZjk2MTNlODBjNTI2YmM3ZSIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc2NTgwNDc3NSwiZXhwIjoxNzY1ODA4Mzc1fQ.test";
    setToken(testToken);
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* LEFT SIDE: Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:w-5/12 bg-white z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          
          {/* Header */}
          <div className="text-left mb-10">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Error Alert */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Bypass Button (Dev Tool) */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleBypass}
              className="w-full group flex items-center justify-center gap-2 py-2 px-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>Developer Bypass</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Image/Background - Hidden on Mobile */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-indigo-900/20 mix-blend-multiply z-10" />
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1497294815431-9365093b7331?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Office background"
        />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white z-20 bg-gradient-to-t from-black/80 to-transparent">
          <h2 className="text-3xl font-bold mb-2">Modern Architecture</h2>
          <p className="text-gray-200">
            Secure, scalable, and built for performance. Access your dashboard to manage your resources efficiently.
          </p>
        </div>
      </div>
    </div>
  );
}