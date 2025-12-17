import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, Plus, Search, MoreVertical, Globe, 
  Command, LayoutDashboard, User, Shield, FileText, 
  Settings, LogOut, ChevronRight, Lock, RefreshCw, Loader2, X, Check,
  Briefcase, Users, Link as LinkIcon, AlignLeft
} from "lucide-react";
import { getToken, getAuthHeaders } from "../lib/auth"; 

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form State
  const [newOrgData, setNewOrgData] = useState({
    name: "",
    domain: "",
    industry: "",
    size: "1-10",
    website: "",
    description: "",
    plan: "Basic"
  });

  const navigate = useNavigate();

  // --- Fetch Real Organizations ---
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const url = new URL('http://127.0.0.1:3000/api/organizations');
      url.searchParams.append('userId', userId);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch organizations');

      const orgList = Array.isArray(data) ? data : (data.data || []);
      setOrganizations(orgList);

    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // --- Auto-generate domain helper ---
  const handleNameChange = (e) => {
    const name = e.target.value;
    
    // Auto-suggest a cleaner domain
    const slug = name.toLowerCase().trim().replace(/[^\w]/g, ''); 
    const autoDomain = slug ? `${slug}.com` : "";
    
    setNewOrgData(prev => ({
        ...prev,
        name: name,
        domain: prev.domain.includes('.') ? prev.domain : autoDomain
    }));
  };

  // --- Submit Create Organization ---
  const submitCreateOrganization = async (e) => {
    e.preventDefault();
    
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');

    if (!userId || !userEmail) {
      alert("User session invalid. Please log out and log in again.");
      return;
    }

    if (!newOrgData.name || !newOrgData.domain) return;

    setCreating(true);

    try {
      // 1. Clean Domain
      let cleanDomain = newOrgData.domain.toLowerCase().trim();
      cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      // 2. Clean Website URL (Ensure it has protocol if missing, but we strip it for DB consistency or keep as is depending on preference)
      // Ideally, store full URL for websites.
      let cleanWebsite = newOrgData.website.trim();
      if (cleanWebsite && !cleanWebsite.startsWith('http')) {
          cleanWebsite = `https://${cleanWebsite}`;
      }

      const payload = {
        name: newOrgData.name.trim(),
        domain: cleanDomain,
        plan: newOrgData.plan,
        industry: newOrgData.industry,
        size: newOrgData.size,
        website: cleanWebsite,
        description: newOrgData.description,
        owner_ID: userId,
        adminEmail: userEmail,
        createdAt: new Date().toISOString()
      };

      const res = await fetch('http://127.0.0.1:3000/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || 'Failed to create organization');
      }

      const newOrg = resData.data || resData;
      
      // Update UI
      setOrganizations(prevOrgs => [newOrg, ...prevOrgs]);
      setIsModalOpen(false);
      // Reset Form
      setNewOrgData({ 
        name: "", domain: "", industry: "", size: "1-10", website: "", description: "", plan: "Basic" 
      }); 

      // Redirect to the newly created organization details page
      navigate(`/organization/${newOrg._id || newOrg.id}`);
      
    } catch (err) {
      console.error('Error creating organization:', err);
      alert(`Failed to create organization: ${err.message || 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const hasOrganization = organizations.length >= 1;

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.domain && org.domain.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans relative">
      <Sidebar activePage="Organizations" />
      
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Organizations</h1>
              <p className="text-slate-500 text-sm dark:text-slate-400 mt-1">Manage your workspace.</p>
            </div>
            <div className="flex flex-col items-end gap-1">
                <button 
                    disabled={hasOrganization} 
                    onClick={() => setIsModalOpen(true)} 
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all ${
                        hasOrganization 
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                    }`}
                >
                    {hasOrganization ? <Lock size={16} /> : <Plus size={18} />}
                    <span>Create Organization</span>
                </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search organizations..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" 
                />
            </div>
            <button 
              onClick={fetchOrganizations} 
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
            >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Content Area */}
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-4">
               <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
               <p className="text-slate-500">Loading organizations...</p>
             </div>
          ) : filteredOrgs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrgs.map((org) => (
                <div key={org._id || org.id} className="group bg-white dark:bg-slate-800 border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-700">
                          {org.name ? org.name.charAt(0).toUpperCase() : 'O'}
                        </div>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><MoreVertical size={18} /></button>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{org.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                      <Globe size={14} />
                      {org.domain}
                    </div>
                    {org.industry && (
                        <div className="text-xs text-slate-400 mb-2">
                            {org.industry} • {org.size} employees
                        </div>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">Active</span>
                        <button 
                          onClick={() => navigate(`/organization/${org._id || org.id}`)} 
                          className="text-sm font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                          Manage <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-300">
              <div className="inline-flex p-4 bg-white rounded-full mb-4 shadow-sm">
                <Building2 size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No organizations found</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2">
                You haven't created any organizations yet. Click the "Create Organization" button to get started.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* --- DETAILED CREATE ORGANIZATION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Create New Organization</h3>
                    <p className="text-xs text-slate-500">Enter your company details below</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={20} />
                </button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={submitCreateOrganization} className="p-6 space-y-6">
                
                {/* Row 1: Name & Domain */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Building2 size={14} className="text-slate-400"/> Organization Name
                        </label>
                        <input 
                            type="text" 
                            required
                            value={newOrgData.name}
                            onChange={handleNameChange}
                            placeholder="e.g. Acme Corp"
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                        />
                    </div>
                    
                    {/* Domain Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Globe size={14} className="text-slate-400"/> Primary Domain
                        </label>
                        <div className="flex items-center">
                            <span className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border-y border-l border-slate-200 dark:border-slate-700 rounded-l-xl text-slate-500 text-xs font-medium">https://</span>
                            <input 
                                type="text" 
                                required
                                value={newOrgData.domain}
                                onChange={(e) => setNewOrgData({...newOrgData, domain: e.target.value})}
                                placeholder="www.yourcompany.com"
                                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-xl focus:ring-2 focus:ring-indigo-500/50 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Row 2: Industry & Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Briefcase size={14} className="text-slate-400"/> Industry
                        </label>
                        <select 
                            value={newOrgData.industry}
                            onChange={(e) => setNewOrgData({...newOrgData, industry: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
                        >
                            <option value="" disabled>Select Industry</option>
                            <option value="Technology">Technology & SaaS</option>
                            <option value="Finance">Finance & Banking</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Education">Education</option>
                            <option value="Retail">Retail & E-commerce</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Users size={14} className="text-slate-400"/> Company Size
                        </label>
                        <select 
                            value={newOrgData.size}
                            onChange={(e) => setNewOrgData({...newOrgData, size: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
                        >
                            <option value="1-10">1-10 Employees</option>
                            <option value="11-50">11-50 Employees</option>
                            <option value="51-200">51-200 Employees</option>
                            <option value="201-500">201-500 Employees</option>
                            <option value="500+">500+ Employees</option>
                        </select>
                    </div>
                </div>

                {/* Row 3: Website URL - UPDATED */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <LinkIcon size={14} className="text-slate-400"/> Website URL (Optional)
                    </label>
                    <div className="flex items-center">
                        <span className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border-y border-l border-slate-200 dark:border-slate-700 rounded-l-xl text-slate-500 text-xs font-medium">https://</span>
                        <input 
                            type="text" 
                            value={newOrgData.website}
                            onChange={(e) => setNewOrgData({...newOrgData, website: e.target.value})}
                            placeholder="www.example.com"
                            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-xl focus:ring-2 focus:ring-indigo-500/50 outline-none"
                        />
                    </div>
                </div>

                {/* Row 4: Description */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <AlignLeft size={14} className="text-slate-400"/> Description
                    </label>
                    <textarea 
                        rows="3"
                        value={newOrgData.description}
                        onChange={(e) => setNewOrgData({...newOrgData, description: e.target.value})}
                        placeholder="Briefly describe what your organization does..."
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"
                    />
                </div>
                
                {/* Modal Footer */}
                <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={creating}
                        className="flex-1 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                        {creating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        {creating ? "Creating..." : "Create Organization"}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// --- Sub-Components ---

function Sidebar({ activePage }) {
  const navigate = useNavigate();
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white h-screen sticky top-0 dark:bg-slate-900 dark:border-slate-800">
      <div className="p-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg">
            <Command size={18} />
        </div>
        <h2 className="font-bold text-slate-900 text-sm dark:text-white">SecureOMS</h2>
      </div>
      <nav className="flex-1 px-3 space-y-1 mt-4">
        <NavItem icon={LayoutDashboard} label="Dashboard" active={activePage === 'Dashboard'} onClick={() => navigate('/dashboard')} />
        <NavItem icon={User} label="Profile" active={activePage === 'Profile'} onClick={() => navigate('/profile')} />
        <NavItem icon={Shield} label="Security" active={activePage === 'Security'} onClick={() => navigate('/security')} />
        <NavItem icon={Building2} label="Organizations" active={activePage === 'Organizations'} onClick={() => navigate('/organizations')} />
        <NavItem icon={FileText} label="Documents" active={activePage === 'Documents'} onClick={() => navigate('/documents')} />
        
        <div className="mt-6 border-t border-slate-100 pt-4 mx-2 mb-2">
            <NavItem icon={Settings} label="Preferences" onClick={() => navigate('/settings')} />
            <NavItem icon={LogOut} label="Sign Out" onClick={() => {
                localStorage.clear();
                navigate('/login');
            }} />
        </div>
      </nav>
    </aside>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            active 
            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" 
            : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
        }`}
    >
      <Icon size={18} className={active ? "text-indigo-600" : "text-slate-400"} />
      <span>{label}</span>
    </button>
  );
}