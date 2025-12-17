import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Activity,
  Users,
  Building2,
  Settings,
  LogOut,
  Crown,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  BarChart3,
  FileText,
  Database,
  Bell,
  Search,
  User
} from "lucide-react";

export default function AdminNavigation() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: Activity,
      current: location.pathname === '/admin/dashboard'
    },
    {
      title: 'Analytics',
      href: '/admin/charts',
      icon: BarChart3,
      current: location.pathname === '/admin/charts'
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: Users,
      current: location.pathname === '/admin/users'
    },
    {
      title: 'Organizations',
      href: '/admin/organizations',
      icon: Building2,
      current: location.pathname === '/admin/organizations'
    },
    {
      title: 'Reports',
      href: '/admin/reports',
      icon: FileText,
      current: location.pathname === '/admin/reports'
    },
    {
      title: 'Database',
      href: '/admin/database',
      icon: Database,
      current: location.pathname === '/admin/database'
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: location.pathname === '/admin/settings'
    }
  ];

  const NavItem = ({ item }) => (
    <Link
      to={item.href}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
        item.current
          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
      }`}
    >
      <item.icon size={18} className={item.current ? 'text-red-400' : 'text-slate-400'} />
      <span className="font-medium">{item.title}</span>
      {item.current && <ChevronRight size={16} className="ml-auto text-red-400" />}
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-red-500" />
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              </div>
            </div>

            {/* Center - Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <Search size={18} />
                </button>
                <input
                  type="text"
                  placeholder="Search admin panel..."
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                />
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50"
                    >
                      <div className="p-2">
                        <div className="text-xs text-slate-400 px-2 py-1">Recent Searches</div>
                        {['User Management', 'System Settings', 'Analytics'].map((item, index) => (
                          <button
                            key={index}
                            className="w-full text-left px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Bell size={18} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50"
                    >
                      <div className="p-4 border-b border-slate-700">
                        <h3 className="font-semibold text-white">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {[
                          { type: 'warning', message: 'Server load above 80%', time: '5m ago' },
                          { type: 'info', message: 'New user registration spike', time: '1h ago' },
                          { type: 'success', message: 'System backup completed', time: '2h ago' }
                        ].map((notif, index) => (
                          <div key={index} className="p-4 border-b border-slate-700 last:border-b-0">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 ${
                                notif.type === 'warning' ? 'bg-yellow-500' :
                                notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1">
                                <p className="text-sm text-white">{notif.message}</p>
                                <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <User size={14} />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-white">Admin User</div>
                    <div className="text-xs text-slate-400">admin@system.com</div>
                  </div>
                  <ChevronDown size={16} className="text-slate-400" />
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50"
                    >
                      <div className="p-3 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <User size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-white">Admin User</div>
                            <div className="text-xs text-slate-400">admin@system.com</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors">
                          <User size={16} />
                          Profile
                        </button>
                        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors">
                          <Settings size={16} />
                          Settings
                        </button>
                        <div className="border-t border-slate-700 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-400 hover:bg-slate-700 rounded transition-colors"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 transition-all duration-300 overflow-hidden`}>
          <nav className="p-4 space-y-1">
            {/* Admin Badge */}
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={16} className="text-red-400" />
                <span className="text-sm font-semibold text-red-400">Administrator</span>
              </div>
              <p className="text-xs text-slate-400">Full system access</p>
            </div>

            {/* Navigation Items */}
            {navigationItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}

            {/* System Status */}
            <div className="mt-6 p-3 bg-slate-900/50 rounded-lg">
              <h4 className="text-xs font-semibold text-slate-400 mb-2">System Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Server</span>
                  <span className="text-green-400">Online</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Database</span>
                  <span className="text-green-400">Connected</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">API</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen">
          {/* Breadcrumb */}
          <div className="bg-slate-800/30 border-b border-slate-700 px-6 py-3">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/admin/dashboard" className="text-slate-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              {location.pathname !== '/admin/dashboard' && (
                <>
                  <ChevronRight size={16} className="text-slate-500" />
                  <span className="text-white capitalize">
                    {location.pathname.split('/').pop()}
                  </span>
                </>
              )}
            </nav>
          </div>
        </main>
      </div>
    </div>
  );
}
