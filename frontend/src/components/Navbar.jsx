import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getToken, logout } from "../lib/auth";
import { Shield, Command, User, LogOut, ChevronDown, LayoutDashboard, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const token = getToken();
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === "/";
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const menuRef = useRef(null);

  // Load user profile data
  useEffect(() => {
    if (token) {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        const profileKey = `userProfile_${userEmail}`;
        const savedData = localStorage.getItem(profileKey);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setUserProfile(parsed);
        }
      }
    }
  }, [token]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkBase = "relative text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400";
  const linkActive = ({ isActive }) => 
    isActive 
      ? "text-indigo-600 dark:text-indigo-400" 
      : "text-slate-600 dark:text-slate-400";

  const formatTime = (date) => {
    // Check for preference in localStorage (default to 12h)
    const use24Hour = localStorage.getItem('clockFormat') === '24h';
    const timezone = localStorage.getItem('appTimezone');

    if (timezone && timezone.startsWith('UTC')) {
      const offset = parseFloat(timezone.replace('UTC', '') || '0');
      // Shift time by offset hours (in ms) and display as UTC to maintain the shift
      const shiftedDate = new Date(date.getTime() + offset * 3600000);
      return shiftedDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: !use24Hour,
        timeZone: 'UTC'
      });
    }

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: !use24Hour });
  };

  const isReducedMotion = localStorage.getItem('reducedMotion') === 'true';

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-slate-200/50 dark:bg-slate-950/80 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* --- Logo Area --- */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Command size={18} />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            SecureOMS
          </span>
        </a>

        {/* --- Right Actions --- */}
        <div className="flex items-center gap-6">
          
          {/* Admin Access (Landing Only) */}
          {isLandingPage && !token && (
            <a 
              href="/admin/login" 
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all text-xs font-bold uppercase tracking-wider shadow-sm dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
            >
              <Shield size={12} />
              Admin Portal
            </a>
          )}

          {/* Clock Display */}
          <div className="hidden md:block text-sm font-medium text-slate-500 dark:text-slate-400 tabular-nums mr-2">
            {formatTime(currentTime)}
          </div>

          {/* Theme Toggle */}
          <div className="border-r border-slate-200 dark:border-slate-800 pr-6 mr-2 hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {!isLandingPage && (
              <NavLink to="/" className={({ isActive }) => `${linkBase} ${linkActive({ isActive })}`}>
                Home
              </NavLink>
            )}
            
            {token && (
              <>
                 {/* Only show these if NOT on dashboard to avoid redundancy with Sidebar */}
                 {!location.pathname.includes('dashboard') && (
                    <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${linkActive({ isActive })}`}>
                      Console
                    </NavLink>
                 )}
              </>
            )}

            {/* User Profile Dropdown */}
            {token ? (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                      {userProfile?.profilePicture ? (
                        <img 
                          src={userProfile.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600">
                          {userProfile?.firstName?.[0] || 'U'}{userProfile?.lastName?.[0] || 'S'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: isReducedMotion ? 0 : 10, scale: isReducedMotion ? 1 : 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: isReducedMotion ? 0 : 10, scale: isReducedMotion ? 1 : 0.95 }}
                      transition={{ duration: isReducedMotion ? 0 : 0.1 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {userProfile?.firstName && userProfile?.lastName 
                            ? `${userProfile.firstName} ${userProfile.lastName}` 
                            : userProfile?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{userProfile?.email || 'user@example.com'}</p>
                      </div>

                      <DropdownItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsMenuOpen(false)} />
                      <DropdownItem to="/my-organization" icon={Building2} label="My Organization" onClick={() => setIsMenuOpen(false)} />
                      <DropdownItem to="/profile" icon={User} label="Profile Settings" onClick={() => setIsMenuOpen(false)} />
                      
                      <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                          <LogOut size={16} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Unauthenticated State
              <div className="flex items-center gap-4">
                <a href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Log in
                </a>
                <a 
                  href="/sign-up" 
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 shadow-md shadow-slate-900/20 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-all"
                >
                  Get Started
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Helper Component for Dropdown Links
function DropdownItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-colors"
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );
}