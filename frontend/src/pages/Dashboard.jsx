import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Loader2,
  Bell,
  Settings,
  Shield,
  Lock,
  Activity,
  Command,
  LayoutDashboard,
  User,
  FileText,
  ChevronRight,
  LogOut,
  Search,
  Users,
} from "lucide-react";
import { getToken, getAuthHeaders } from "../lib/auth";

// Mock Activity Data
const MOCK_ACTIVITY = [
  { id: 1, action: "System Initialized", time: "Just now", status: "success" },
  { id: 2, action: "Security Check Passed", time: "5 mins ago", status: "success" },
];

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [orgCount, setOrgCount] = useState(0);
  const [affiliatedOrgs, setAffiliatedOrgs] = useState([]);
  const [ownedOrgs, setOwnedOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);
  const [securityScore, setSecurityScore] = useState(50);

  // 1. Load User Profile
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

          // Calculate Security Score
          let score = 50; // Base score
          if (parsed.twoFactorEnabled) score += 20;
          if (parsed.loginAlertsEnabled !== false) score += 10;
          if (parsed.isVerified) score += 10;
          if (parsed.role === 'admin') score += 10;
          
          const lastChange = parsed.lastPasswordChange ? new Date(parsed.lastPasswordChange) : new Date(parsed.createdAt || Date.now());
          const daysSinceChange = Math.floor((new Date() - lastChange) / (1000 * 60 * 60 * 24));
          if (daysSinceChange < 90) score += 10;

          setSecurityScore(Math.min(100, score));
        }
      }
    }
  }, []);

  // 2. Fetch Organization Data (Owned and Affiliated)
  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const token = getToken();
        const userId = localStorage.getItem('userId');

        if (!userId) {
            setOrgCount(0);
            setAffiliatedOrgs([]);
            setLoading(false);
            return;
        }

        // Fetch user's OWNED organizations
        const ownedUrl = new URL('http://127.0.0.1:3000/api/organizations');
        ownedUrl.searchParams.append('userId', userId);

        const ownedRes = await fetch(ownedUrl.toString(), {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (ownedRes.ok) {
            const data = await ownedRes.json();
            const orgList = Array.isArray(data) ? data : (data.data || []);
            
            // Split into Owned and Affiliated
            const myOrgs = orgList.filter(org => String(org.owner_ID) === String(userId));
            const joinedOrgs = orgList.filter(org => String(org.owner_ID) !== String(userId));

            setOrgCount(myOrgs.length);
            setOwnedOrgs(myOrgs.map(org => ({
                id: org._id || org.id,
                name: org.name,
                role: 'Owner',
                status: org.status || 'Active'
            })));

            setAffiliatedOrgs(joinedOrgs.map(org => ({
                id: org._id || org.id,
                name: org.name,
                role: 'Member',
                status: org.status || 'Active'
            })));
            
            // Calculate Total Members in Owned Organizations
            const memberCount = myOrgs.reduce((acc, org) => {
                const count = Array.isArray(org.members) ? org.members.length : (typeof org.members === 'number' ? org.members : 0);
                return acc + count;
            }, 0);
            setTotalMembers(memberCount);
        } else {
            setOrgCount(0);
            setTotalMembers(0);
            setOwnedOrgs([]);
            setAffiliatedOrgs([]);
        }

        // Fetch Notifications
        const notifRes = await fetch(`http://127.0.0.1:3000/api/notifications?userId=${userId}`, {
            headers: getAuthHeaders()
        });
        if (notifRes.ok) {
            const notifData = await notifRes.json();
            setNotifications(notifData.map(n => ({
                id: n._id,
                title: n.title,
                message: n.message,
                time: new Date(n.createdAt).toLocaleDateString(),
                unread: n.unread,
                type: n.type
            })));
        }

      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        setOrgCount(0);
        setTotalMembers(0);
        setAffiliatedOrgs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
  }, []);

  const handleMarkAllRead = async () => {
    const userId = localStorage.getItem('userId');
    try {
        await fetch('http://127.0.0.1:3000/api/notifications/read', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId })
        });
        setNotifications(prev => prev.map(n => ({...n, unread: false})));
    } catch (e) { console.error(e); }
  };

  // Calculate percentage (Assuming max 1 organization for Basic plan)
  const maxOrgs = 1; 
  const orgPercentage = Math.min((orgCount / maxOrgs) * 100, 100);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* --- Sidebar --- */}
      <Sidebar activePage="Dashboard" />

      {/* --- Main Content --- */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Dashboard Overview
              </h1>
              <p className="text-slate-500 text-sm dark:text-slate-400 mt-1">
                Welcome back, {userProfile?.firstName || 'User'}! Here is your account summary.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Notification Bell with Dropdown */}
              <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Bell size={20} className="text-slate-600 dark:text-slate-300" />
                    {notifications.filter(n => n.unread).length > 0 && (
                      <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</h3>
                            <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">Mark all read</button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <div key={notif.id} className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${notif.unread ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-sm ${notif.unread ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{notif.title}</p>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{notif.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    No notifications
                                </div>
                            )}
                        </div>
                    </div>
                  )}
              </div>
              <button 
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all"
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Account Status" value="Active" icon={Shield} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-500/10" />
            <StatCard title="Security Score" value={`${securityScore}%`} icon={Lock} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-500/10" />
            <StatCard title="Total Members" value={loading ? "..." : totalMembers} icon={Users} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-500/10" />
            
            {/* REAL DATA STAT CARD */}
            <StatCard 
                title="Owned Orgs" 
                value={loading ? "..." : `${orgCount}/${maxOrgs}`} 
                icon={Building2} 
                color="text-purple-600" 
                bg="bg-purple-50 dark:bg-purple-500/10" 
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Organizations Usage Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Usage Limit</h3>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                    Basic Plan
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Total Owned Organizations</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : `${orgCount} / ${maxOrgs}`}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${orgPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    You have used {Math.round(orgPercentage)}% of your allowance. 
                    {orgCount === 0 && " Create your first organization to get started."}
                </p>
                {orgCount === 0 && (
                    <button 
                        onClick={() => navigate('/organizations')}
                        className="w-full mt-2 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                        Create Organization
                    </button>
                )}
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                <button className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {MOCK_ACTIVITY.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
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

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <ActionButton icon={Building2} label="My Organizations" onClick={() => navigate('/organizations')} />
                <ActionButton icon={User} label="Edit Profile" onClick={() => navigate('/profile')} />
                <ActionButton icon={Lock} label="Security Settings" onClick={() => navigate('/security')} />
              </div>
            </div>

          </div>
          
          {/* --- OWNED ORGANIZATIONS SECTION --- */}
          <div className="pt-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">My Organizations ({ownedOrgs.length})</h2>
              
              {loading ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading organizations...
                </div>
              ) : ownedOrgs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ownedOrgs.map((org) => (
                        <AffiliateCard key={org.id} org={org} navigate={navigate} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">You haven't created any organizations yet.</p>
                    <button 
                        onClick={() => navigate('/organizations')}
                        className="mt-3 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                    >
                        Create one now
                    </button>
                </div>
              )}
          </div>

          {/* --- AFFILIATED ORGANIZATIONS SECTION (NEW) --- */}
          <div className="pt-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">Affiliated Workspaces ({affiliatedOrgs.length})</h2>
              
              {loading ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading affiliations...
                </div>
              ) : affiliatedOrgs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {affiliatedOrgs.map((org) => (
                        <AffiliateCard key={org.id} org={org} navigate={navigate} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">You are not a member of any external organizations.</p>
                </div>
              )}
          </div>
          {/* --------------------------------------------- */}

        </div>
      </main>
    </div>
  );
}

// --- New Sub-Component for Affiliated Orgs ---

function AffiliateCard({ org, navigate }) {
    const statusColor = org.status === 'Active' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-600 bg-slate-100 dark:bg-slate-700/50';
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 p-4 flex justify-between items-center transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <Building2 size={18} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">{org.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-xs text-slate-500 dark:text-slate-400">{org.role}</span>
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor}`}>
                            {org.status}
                         </span>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => navigate(`/organization/${org.id}`)} 
                className="p-2 text-slate-500 hover:text-indigo-600 transition-colors"
                title={`Access ${org.name}`}
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}


// --- Existing Sub-Components (Unchanged) ---

export function Sidebar({ activePage }) {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

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
      {/* Brand */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Command size={18} />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-sm dark:text-white">SecureOMS</h2>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Client Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-4">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Menu</div>
        <NavItem icon={LayoutDashboard} label="Dashboard" active={activePage === 'Dashboard'} onClick={() => navigate('/dashboard')} />
        <NavItem icon={User} label="Profile" active={activePage === 'Profile'} onClick={() => navigate('/profile')} />
        <NavItem icon={Shield} label="Security" active={activePage === 'Security'} onClick={() => navigate('/security')} />
        <NavItem icon={Building2} label="Organizations" active={activePage === 'Organizations'} onClick={() => navigate('/organizations')} />
        <NavItem icon={Search} label="Find Organization" active={activePage === 'Find Organization'} onClick={() => navigate('/organizations/find')} />
        <NavItem icon={FileText} label="Documents" active={activePage === 'Documents'} onClick={() => navigate('/documents')} />
        
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-6">Settings</div>
        <NavItem icon={Settings} label="Preferences" onClick={() => navigate('/settings')} />
        <NavItem icon={LogOut} label="Sign Out" onClick={() => {
            localStorage.clear();
            navigate('/login');
        }} />
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 w-full p-2 rounded-lg transition-colors group">
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
        </div>
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

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600">
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1 dark:text-slate-100">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${bg} ${color}`}>
        <Icon size={22} />
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors dark:bg-slate-700/50 dark:hover:bg-slate-700 group"
    >
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400 transition-colors" />
        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white transition-colors">{label}</span>
      </div>
    </button>
  );
}