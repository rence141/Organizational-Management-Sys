import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  Settings,
  Bell,
  LogOut,
  Command,
  ChevronRight,
  LayoutDashboard,
  FileText,
  User
} from "lucide-react";
import { getToken, getAuthHeaders } from "../lib/auth";

// Initial Mock Data
const INITIAL_STATS = {
  securityScore: 94,
  lastPasswordChange: "15 days ago",
  activeSessions: 2,
  twoFactorEnabled: true,
  loginAttempts: 0,
  securityAlerts: 1
};

const INITIAL_SETTINGS = [
  { id: 1, title: "Two-Factor Authentication", description: "Add an extra layer of security to your account", enabled: true, icon: Shield },
  { id: 2, title: "Login Alerts", description: "Get notified when someone logs into your account", enabled: true, icon: Bell },
  { id: 3, title: "Session Management", description: "Manage and monitor active sessions", enabled: false, icon: Activity },
  { id: 4, title: "Security Keys", description: "Use hardware security keys for authentication", enabled: false, icon: Key }
];

export default function Security() {
  const [userProfile, setUserProfile] = useState(null);
  
  // State for Dynamic Data
  const [stats, setStats] = useState(INITIAL_STATS);
  const [activityLog, setActivityLog] = useState([]);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  // Form State
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);

  // Load user profile
  useEffect(() => {
    const token = getToken();
    if (token) {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        const profileKey = `userProfile_${userEmail}`;
        const savedData = localStorage.getItem(profileKey);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setUserProfile(parsed);
            setUserData(parsed);
            
            // Update settings based on user profile
            setSettings(prev => prev.map(s => {
                if (s.title === "Two-Factor Authentication") return { ...s, enabled: parsed.twoFactorEnabled || false };
                if (s.title === "Login Alerts") return { ...s, enabled: parsed.loginAlertsEnabled !== false }; // Default true
                return s;
            }));

            // Calculate Score
            let score = 50; // Base score
            if (parsed.twoFactorEnabled) score += 20;
            if (parsed.loginAlertsEnabled !== false) score += 10;
            if (parsed.isVerified) score += 10;
            if (parsed.role === 'admin') score += 10; // Admins usually have higher security reqs met
            
            // Check password age
            const lastChange = parsed.lastPasswordChange ? new Date(parsed.lastPasswordChange) : new Date(parsed.createdAt || Date.now());
            const daysSinceChange = Math.floor((new Date() - lastChange) / (1000 * 60 * 60 * 24));
            if (daysSinceChange < 90) score += 10;
            
            setStats(prev => ({
                ...prev,
                securityScore: Math.min(100, score),
                twoFactorEnabled: parsed.twoFactorEnabled || false,
                lastPasswordChange: daysSinceChange === 0 ? "Today" : `${daysSinceChange} days ago`
            }));
        }
      }
    }

    // Fetch Security Logs
    const fetchLogs = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        try {
            const res = await fetch(`http://127.0.0.1:3000/api/security-logs?userId=${userId}`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setActivityLog(data.map(log => ({
                    id: log._id,
                    action: log.action,
                    time: new Date(log.createdAt).toLocaleString(),
                    status: log.status
                })));
            }
        } catch (e) { console.error("Failed to fetch security logs", e); }
    };
    fetchLogs();
  }, []);

  // --- Handlers ---

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsSubmitting(true);

    // 1. Validation
    if (!passwords.current || !passwords.new || !passwords.confirm) {
        setMessage({ type: "error", text: "All fields are required." });
        setIsSubmitting(false);
        return;
    }
    if (passwords.new !== passwords.confirm) {
        setMessage({ type: "error", text: "New passwords do not match." });
        setIsSubmitting(false);
        return;
    }
    if (passwords.new.length < 8) {
        setMessage({ type: "error", text: "Password must be at least 8 characters." });
        setIsSubmitting(false);
        return;
    }

    // 2. Real API Call
    try {
        const userId = localStorage.getItem('userId');
        const res = await fetch(`http://127.0.0.1:3000/api/users/${userId}/change-password`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
        });

        const data = await res.json();
        
        if (res.ok) {
            setMessage({ type: "success", text: data.message });
            setPasswords({ current: "", new: "", confirm: "" });
            setStats(prev => ({ ...prev, lastPasswordChange: "Just now" }));
        } else {
            setMessage({ type: "error", text: data.message || "Failed to update password" });
        }
    } catch (error) {
        setMessage({ type: "error", text: "Server error occurred." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const toggleSecuritySetting = async (id) => {
    // 1. Find the setting being toggled
    const setting = settings.find(s => s.id === id);
    if (!setting) return;

    const newState = !setting.enabled;
    const title = setting.title;
    const userId = localStorage.getItem('userId');

    // Map setting title to DB field
    let dbField = null;
    if (title === "Two-Factor Authentication") dbField = "twoFactorEnabled";
    else if (title === "Login Alerts") dbField = "loginAlertsEnabled";

    if (dbField) {
        try {
            // Update Backend
            const res = await fetch(`http://127.0.0.1:3000/api/users/${userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ [dbField]: newState })
            });
            
            if (res.ok) {
                // Update Local Storage to persist state across reloads
                const userEmail = localStorage.getItem('userEmail');
                const profileKey = `userProfile_${userEmail}`;
                const currentProfile = JSON.parse(localStorage.getItem(profileKey) || '{}');
                currentProfile[dbField] = newState;
                localStorage.setItem(profileKey, JSON.stringify(currentProfile));
                
                // Recalculate score locally for immediate feedback
                setStats(prev => ({
                    ...prev,
                    securityScore: newState ? Math.min(100, prev.securityScore + (title === "Two-Factor Authentication" ? 20 : 10)) : Math.max(0, prev.securityScore - (title === "Two-Factor Authentication" ? 20 : 10))
                }));
            }
        } catch (e) {
            console.error("Failed to update setting", e);
            return; // Don't update UI if backend fails
        }
    }

    // 2. Update Settings State
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: newState } : s));

    // 3. Update Stats (specific to 2FA)
    if (title === "Two-Factor Authentication") {
        setStats(prev => ({ ...prev, twoFactorEnabled: newState }));
    }

    // 4. Generate Log Message
    let logAction = "";
    if (title === "Two-Factor Authentication") logAction = newState ? "Enabled 2FA" : "Disabled 2FA";
    else if (title === "Login Alerts") logAction = newState ? "Enabled Login Alerts" : "Disabled Login Alerts";
    else if (title === "Session Management") logAction = newState ? "Enabled Session Mgmt" : "Disabled Session Mgmt";
    else if (title === "Security Keys") logAction = newState ? "Enabled Security Keys" : "Disabled Security Keys";

    // 5. Update Activity Log (Limit to 5)
    if (logAction) {
        setActivityLog(prev => {
            const newEntry = {
                id: Date.now(),
                action: logAction,
                time: "Just now",
                status: newState ? "success" : "warning" // Green for On, Orange for Off
            };
            return [newEntry, ...prev].slice(0, 5);
        });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Security Settings
              </h1>
              <p className="text-slate-500 text-sm dark:text-slate-400 mt-1">
                Manage your account security and privacy protocols.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Bell size={20} className="text-slate-600 dark:text-slate-300" />
                {stats.securityAlerts > 0 && (
                  <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse"></span>
                )}
              </button>
            </div>
          </div>

          {/* Security Score Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security Overview</h3>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stats.securityScore > 80 ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                <span className={`text-sm font-medium ${stats.securityScore > 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {stats.securityScore > 80 ? 'Excellent' : 'Needs Attention'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatItem label="Security Score" value={`${stats.securityScore}%`} color="text-indigo-600 dark:text-indigo-400" />
              <StatItem label="Active Sessions" value={stats.activeSessions} color="text-emerald-600 dark:text-emerald-400" />
              <StatItem label="2FA Status" value={stats.twoFactorEnabled ? "ON" : "OFF"} color={stats.twoFactorEnabled ? "text-blue-600 dark:text-blue-400" : "text-slate-500"} />
              <StatItem label="Failed Attempts" value={stats.loginAttempts} color="text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          {/* Settings & Password Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Change Password Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Change Password</h3>
              
              {message.text && (
                <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'}`}>
                    {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                    {message.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100"
                      placeholder="Enter current password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                        <input
                            type="password"
                            value={passwords.new}
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100"
                            placeholder="New password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm</label>
                        <input
                            type="password"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100"
                            placeholder="Confirm"
                        />
                    </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>

            {/* Security Features Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Security Protocols</h3>
              <div className="space-y-4">
                {settings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                        <setting.icon size={18} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white text-sm">{setting.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px]">{setting.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSecuritySetting(setting.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        setting.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Security Activity Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Audit Log</h3>
              <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500 dark:text-slate-300">
                Last 5 Events
              </span>
            </div>
            <div className="space-y-4">
              {activityLog.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                    activity.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{activity.action}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- Helper Components ---

function StatItem({ label, value, color }) {
    return (
        <div className="text-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        </div>
    )
}

function Sidebar() {
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (token) {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        const profileKey = `userProfile_${userEmail}`;
        const savedData = localStorage.getItem(profileKey);
        if (savedData) setUserProfile(JSON.parse(savedData));
      }
    }
  }, []);

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white h-screen sticky top-0 dark:bg-slate-900 dark:border-slate-800">
      <div className="p-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Command size={18} />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-sm dark:text-white">SecureOMS</h2>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Client Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-4">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Menu</div>
        <NavItem icon={LayoutDashboard} label="Dashboard" onClick={() => navigate('/dashboard')} />
        <NavItem icon={User} label="Profile" onClick={() => navigate('/profile')} />
        <NavItem icon={Shield} label="Security" active onClick={() => navigate('/security')} />
        <NavItem icon={FileText} label="Documents" onClick={() => navigate('/documents')} />
        
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-6">Settings</div>
        <NavItem icon={Settings} label="Preferences" onClick={() => navigate('/settings')} />
        <NavItem icon={LogOut} label="Sign Out" onClick={() => navigate('/login')} />
      </nav>

      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <button onClick={() => navigate('/profile')} className="flex items-center gap-3 w-full p-2 hover:bg-slate-50 rounded-lg transition-colors dark:hover:bg-slate-800 group">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 overflow-hidden">
            {userProfile?.profilePicture ? (
              <img src={userProfile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-xs">{userProfile?.firstName?.[0] || 'U'}</span>
            )}
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate dark:text-slate-200">
              {userProfile?.firstName || 'User'}
            </p>
            <p className="text-[10px] text-slate-500 truncate dark:text-slate-400">View Profile</p>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active 
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600"} />
        <span>{label}</span>
      </div>
      {active && <ChevronRight size={14} className="opacity-50" />}
    </button>
  );
}