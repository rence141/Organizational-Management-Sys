import { useState, useEffect } from "react";
import { Users, UserCheck, Ban, Trash2, AlertTriangle, RefreshCw, Search } from "lucide-react";

export default function SuspendedUsers() {
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSuspendedUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const allUsers = await response.json();
        const suspended = allUsers.filter(user => 
          user.status === 'suspended' || 
          (user.isVerified === false && user.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000))
        );
        setSuspendedUsers(suspended);
      } else {
        throw new Error("Failed to fetch suspended users");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuspendedUsers();
  }, []);

  const handleActivate = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuspendedUsers(suspendedUsers.filter(user => user.id !== userId));
      } else {
        throw new Error("Failed to activate user");
      }
    } catch (err) {
      alert("Failed to activate user: " + err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Permanently delete this suspended user?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuspendedUsers(suspendedUsers.filter(user => user.id !== userId));
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    }
  };

  const filteredUsers = suspendedUsers.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading suspended users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Ban size={20} className="text-red-400" />
              Suspended Users
            </h2>
            <p className="text-sm text-slate-400">
              Total Suspended: {suspendedUsers.length}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={fetchSuspendedUsers}
              className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 text-slate-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search suspended users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        {suspendedUsers.length > 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400" />
            <div className="text-sm text-red-400">
              <strong>Warning:</strong> These users have been suspended due to policy violations or inactivity. Review and take appropriate action.
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-700/50 text-slate-200 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Ban size={32} className="opacity-20" />
                      <p>No suspended users found</p>
                      <p className="text-xs">All users are in good standing</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm border-2 border-slate-600">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name || 'Unknown User'}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs font-medium border bg-slate-700 text-slate-300 border-slate-600">
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-red-500/10 text-red-400 border-red-500/20">
                        <Ban size={12} />
                        Suspended
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleActivate(user.id)}
                          className="p-1.5 border border-green-500/30 text-green-400 rounded hover:bg-green-500/10 transition-colors"
                          title="Activate User"
                        >
                          <UserCheck size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
