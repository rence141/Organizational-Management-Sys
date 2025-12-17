import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  MoreVertical, 
  Search, 
  Plus, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  TrendingUp,
  Server
} from "lucide-react";
import AddOrganizationModal from "../components/AddOrganizationModal";
import { getOrganizations } from "../services/organizationService";

// Mock Data: The Organizations you are managing
const INITIAL_ORGS = [
  { id: 1, name: "Acme Corp", domain: "acme.com", plan: "Enterprise", users: 1240, status: "Active", health: 98, revenue: "$12,400" },
  { id: 2, name: "Stark Industries", domain: "stark.net", plan: "Pro", users: 85, status: "Active", health: 100, revenue: "$2,500" },
  { id: 3, name: "Global Logistics", domain: "globallog.co", plan: "Basic", users: 12, status: "Suspended", health: 0, revenue: "$0" },
  { id: 4, name: "Cyber Dyne", domain: "cyberdyne.sys", plan: "Enterprise", users: 4500, status: "Warning", health: 75, revenue: "$45,000" },
  { id: 5, name: "Wayne Enterprises", domain: "wayne.tech", plan: "Pro", users: 320, status: "Active", health: 99, revenue: "$8,200" },
];

export default function TestDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [organizations, setOrganizations] = useState(INITIAL_ORGS);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load organizations from API
  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await getOrganizations();
      setOrganizations(data);
    } catch (error) {
      console.error('Failed to load organizations:', error);
      // Fallback to mock data if API fails
      setOrganizations(INITIAL_ORGS);
    } finally {
      setLoading(false);
    }
  };

  // Load organizations on component mount
  useEffect(() => {
    loadOrganizations();
  }, []);

  // Filter Logic
  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) || org.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || org.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen text-slate-900">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organization Management (Test Mode)</h1>
          <p className="text-slate-500 text-sm">Overview of all registered entities and tenants. No authentication required.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-indigo-200 transition-all"
        >
          <Plus size={18} />
          <span>New Organization</span>
        </button>
      </div>

      {/* --- High Level Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Organizations" value={organizations.length} icon={Building2} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard title="Total Active Users" value="8,432" icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="System Load" value="34%" icon={Server} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Pending Approvals" value="3" icon={AlertCircle} color="text-orange-600" bg="bg-orange-50" />
      </div>

      {/* --- Main Table Section --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or domain..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-slate-200/50 p-1 rounded-lg">
            {["All", "Active", "Suspended"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                  filterStatus === status 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Organization</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Health Score</th>
                <th className="px-6 py-4 font-semibold">MRR</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrgs.map((org, index) => (
                <motion.tr 
                  key={org._id || org.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-lg">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{org.name}</div>
                        <div className="text-slate-500 text-xs">{org.domain}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      org.plan === 'Enterprise' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                      org.plan === 'Pro' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={org.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${org.health > 90 ? 'bg-emerald-500' : org.health > 50 ? 'bg-orange-400' : 'bg-red-500'}`} 
                          style={{ width: `${org.health}%` }} 
                        />
                      </div>
                      <span className="text-xs text-slate-500">{org.health}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {org.revenue}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              
              {filteredOrgs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="opacity-20" />
                      <p>No organizations found matching "{searchTerm}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Pagination (Visual) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs text-slate-500">
          <span>Showing {filteredOrgs.length} of {organizations.length} organizations</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50">Next</button>
          </div>
        </div>

      </div>

      {/* Add Organization Modal */}
      <AddOrganizationModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onOrganizationAdded={loadOrganizations}
      />
    </div>
  );
}

// --- Sub-Components ---

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors">
      <div>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${bg} ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Suspended: "bg-red-50 text-red-700 border-red-100",
    Warning: "bg-amber-50 text-amber-700 border-amber-100",
  };
  
  const icons = {
    Active: <CheckCircle2 size={12} />,
    Suspended: <XCircle size={12} />,
    Warning: <AlertCircle size={12} />,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.Active}`}>
      {icons[status] || icons.Active}
      {status}
    </span>
  );
}
