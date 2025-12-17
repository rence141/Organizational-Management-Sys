import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, MoreVertical, Mail, Phone, Calendar, Shield, UserPlus, Edit, Trash2, Lock, Crown, User } from "lucide-react";
import { canManageUsers, isClient, getCurrentUserRole } from "../lib/permissions";

const mockUsers = [
  { id: 1, name: "John Doe", email: "john@acme.com", role: "Admin", status: "Active", lastLogin: "2024-12-15", phone: "+1 234-567-8900" },
  { id: 2, name: "Jane Smith", email: "jane@stark.net", role: "User", status: "Active", lastLogin: "2024-12-14", phone: "+1 234-567-8901" },
  { id: 3, name: "Bob Johnson", email: "bob@globallog.co", role: "Manager", status: "Suspended", lastLogin: "2024-12-10", phone: "+1 234-567-8902" },
  { id: 4, name: "Alice Brown", email: "alice@cyberdyne.sys", role: "User", status: "Active", lastLogin: "2024-12-15", phone: "+1 234-567-8903" },
  { id: 5, name: "Charlie Wilson", email: "charlie@wayne.tech", role: "Admin", status: "Warning", lastLogin: "2024-12-13", phone: "+1 234-567-8904" },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [users, setUsers] = useState(mockUsers);
  
  const canAddUsers = canManageUsers();
  const isUserClient = isClient();
  const currentUserRole = getCurrentUserRole();

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <Crown size={16} className="text-purple-600" />;
      case 'manager': return <Shield size={16} className="text-blue-600" />;
      default: return <User size={16} className="text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || user.role === filterRole;
    const matchesStatus = filterStatus === "All" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case "Active": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Suspended": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Warning": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case "Admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "Manager": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "User": return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen dark:bg-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Management</h1>
            {currentUserRole && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(currentUserRole)}`}>
                {getRoleIcon(currentUserRole)}
                <span className="capitalize">{currentUserRole}</span>
              </div>
            )}
          </div>
          <p className="text-slate-500 text-sm dark:text-slate-400">
            {isUserClient ? "View system users and permissions" : "Manage system users and permissions"}
          </p>
        </div>
        {canAddUsers && (
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-indigo-200 transition-all dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:shadow-indigo-900/20">
            <UserPlus size={18} />
            <span>Add User</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider dark:text-slate-400">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 dark:text-slate-100">{users.length}</h3>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Users size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider dark:text-slate-400">Active</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 dark:text-slate-100">{users.filter(u => u.status === 'Active').length}</h3>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Shield size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider dark:text-slate-400">Admins</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 dark:text-slate-100">{users.filter(u => u.role === 'Admin').length}</h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Shield size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider dark:text-slate-400">Suspended</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 dark:text-slate-100">{users.filter(u => u.status === 'Suspended').length}</h3>
            </div>
            <div className="p-3 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <Shield size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Warning">Warning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-800 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Last Login</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/80"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</div>
                        <div className="text-slate-500 text-xs dark:text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      {user.lastLogin}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Mail size={14} className="text-slate-400 dark:text-slate-500" />
                        <span className="text-xs text-slate-600 dark:text-slate-400">{user.email.split('@')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone size={14} className="text-slate-400 dark:text-slate-500" />
                        <span className="text-xs text-slate-600 dark:text-slate-400">{user.phone.split('-')[2]}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canAddUsers && (
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors dark:hover:bg-slate-700/50 dark:text-slate-400 dark:hover:text-slate-300">
                          <Edit size={16} />
                        </button>
                      )}
                      {canAddUsers && (
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600 transition-colors dark:hover:bg-slate-700/50 dark:text-slate-400 dark:hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      )}
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors dark:hover:bg-slate-700/50 dark:text-slate-400 dark:hover:text-slate-300">
                        <MoreVertical size={16} />
                      </button>
                      {!canAddUsers && (
                        <div className="p-2 rounded-lg text-slate-400 dark:text-slate-500" title="No permission to edit">
                          <Lock size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
