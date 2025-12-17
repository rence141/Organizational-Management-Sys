// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, UserCheck, Activity, TrendingUp, Shield, Crown, Settings, 
  LogOut, Menu, X, Server, Search, RefreshCw, Calendar, 
  CheckCircle, Ban, Trash2, Building2, AlertTriangle, Plus, Globe,
  ArrowLeft, ArrowRight, Briefcase, BarChart3
} from "lucide-react";
import AdminCharts from "./AdminCharts";
import { fetchWithAuth } from "../../lib/api";
import ErrorBoundary from "../../components/ErrorBoundary";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    totalOrganizations: 0,
    serverStatus: 'online',
    systemHealth: 100,
    recentActivity: []
  });

  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [orgSearch, setOrgSearch] = useState("");

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [dashboardData, recentUsers, orgData] = await Promise.all([
        fetchWithAuth('/analytics/dashboard'),
        fetchWithAuth('/users?limit=5&sort=-createdAt'),
        fetchWithAuth('/analytics/organizations')
      ]);

      setStats(prev => ({
        ...prev,
        totalUsers: dashboardData.stats.totalUsers,
        activeUsers: dashboardData.stats.activeUsers,
        newUsers: dashboardData.stats.newUsers,
        totalOrganizations: dashboardData.stats.totalOrganizations,
        userGrowth: dashboardData.stats.userGrowth || 0,
        activeUserGrowth: dashboardData.stats.activeUserGrowth || 0,
        newUserGrowth: dashboardData.stats.newUserGrowth || 0,
        orgGrowth: dashboardData.stats.orgGrowth || 0,
        recentActivity: recentUsers.map(user => ({
          id: user._id,
          type: 'user_signup',
          user: user.name || user.email,
          time: new Date(user.createdAt).toLocaleDateString(),
          status: 'success'
        }))
      }));

      setUsers(recentUsers);
      setOrganizations(orgData.data?.topOrganizations || []);

    } catch (error) {
      console.error("Dashboard Error:", error);
      setError(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredOrgs = organizations.filter(org => 
    org.name?.toLowerCase().includes(orgSearch.toLowerCase()) ||
    org.ownerName?.toLowerCase().includes(orgSearch.toLowerCase())
  );

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await fetchWithAuth(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          isSuspended: currentStatus !== 'Suspended' 
        })
      });
      fetchDashboardData();
    } catch (error) {
      console.error("Error updating user status:", error);
      setError("Failed to update user status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try again <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <button
                    onClick={() => setSelectedView('overview')}
                    className={`${
                      selectedView === 'overview'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setSelectedView('users')}
                    className={`${
                      selectedView === 'users'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Users
                  </button>
                  <button
                    onClick={() => setSelectedView('organizations')}
                    className={`${
                      selectedView === 'organizations'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Organizations
                  </button>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <button
                  onClick={fetchDashboardData}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                  title="Refresh data"
                >
                  <RefreshCw className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {selectedView === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<Users className="h-6 w-6" />}
                    trend={stats.userGrowth}
                  />
                  <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={<UserCheck className="h-6 w-6" />}
                    trend={stats.activeUserGrowth}
                  />
                  <StatCard
                    title="New Users (30d)"
                    value={stats.newUsers}
                    icon={<TrendingUp className="h-6 w-6" />}
                    trend={stats.newUserGrowth}
                  />
                  <StatCard
                    title="Organizations"
                    value={stats.totalOrganizations}
                    icon={<Building2 className="h-6 w-6" />}
                    trend={stats.orgGrowth}
                  />
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Analytics Overview</h2>
                    <AdminCharts users={users} organizations={organizations} />
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="bg-white overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {stats.recentActivity.map((activity) => (
                        <li key={activity.id} className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {activity.status === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Ban className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.user} {activity.type === 'user_signup' ? 'signed up' : 'performed an action'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {selectedView === 'users' && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Users</h3>
                    <div className="mt-3 sm:mt-0 sm:ml-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Search users..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                {user.name?.charAt(0) || 'U'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name || 'Unnamed User'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isSuspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {user.isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.role || 'User'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => toggleUserStatus(user._id, user.isSuspended ? 'Suspended' : 'Active')}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              {user.isSuspended ? 'Activate' : 'Suspend'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedView === 'organizations' && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Organizations</h3>
                    <div className="mt-3 sm:mt-0 sm:ml-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Search organizations..."
                          value={orgSearch}
                          onChange={(e) => setOrgSearch(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {filteredOrgs.map((org) => (
                      <div key={org._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <h4 className="text-lg font-medium text-gray-900">{org.name}</h4>
                              <p className="text-sm text-gray-500">{org.memberCount || 0} members</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>Owner:</span>
                              <span className="font-medium text-gray-900">{org.ownerName || 'N/A'}</span>
                            </div>
                            <div className="mt-2 flex justify-between text-sm text-gray-500">
                              <span>Created:</span>
                              <span className="text-gray-900">
                                {new Date(org.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

function StatCard({ title, value, icon, trend }) {
  const isPositive = trend >= 0;
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3 text-white">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value.toLocaleString()}
                </div>
                {trend !== undefined && (
                  <div
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {trend}%
                    <svg
                      className={`ml-1 h-4 w-4 ${
                        isPositive ? 'text-green-500' : 'text-red-500 transform rotate-180'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}