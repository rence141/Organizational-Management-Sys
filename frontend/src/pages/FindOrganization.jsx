import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Building2, 
  Users, 
  Plus, 
  Loader2, 
  CheckCircle,
  Globe
} from "lucide-react";
import { Sidebar } from "./Dashboard";
import { getToken } from "../lib/auth";

export default function FindOrganization() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const userId = localStorage.getItem('userId');
        const url = new URL('http://127.0.0.1:3000/api/organizations');
        
        if (searchTerm) {
            url.searchParams.append('search', searchTerm);
        }

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const orgList = Array.isArray(data) ? data : (data.data || []);
            
            // Map API data to UI format
            const mappedOrgs = orgList.map(org => ({
                ...org,
                id: org._id || org.id, // Handle MongoDB _id
                members: org.members?.length || org.memberCount || 0,
                // Check if current user is in members list
                isMember: (String(org.owner_ID) === String(userId)) || (org.members && Array.isArray(org.members)
                    ? org.members.some(m => {
                        const mId = typeof m === 'string' ? m : (m._id || m.userId || m.id || m.toString());
                        return mId && userId && String(mId) === String(userId);
                    })
                    : (org.isMember || false)),
                type: org.type || 'Organization'
            }));

            setOrganizations(mappedOrgs);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchOrgs, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleJoin = async (orgId) => {
    setJoiningId(orgId);
    try {
        const token = getToken();
        const userId = localStorage.getItem('userId');

        // Check for invalid userId strings that might be in localStorage
        if (!userId || userId === 'undefined' || userId === 'null') {
            alert("User session invalid. Please log out and log in again.");
            setJoiningId(null);
            return;
        }

        // Send both accId and userId to ensure compatibility with backend
        const payload = { 
            organizationId: orgId, 
            accId: userId,
            userId: userId 
        };
        console.log("Sending Join Request:", payload);

        const response = await fetch('http://127.0.0.1:3000/api/organizations/join', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Successfully joined organization!");
            // Optimistically update UI
            setOrganizations(prev => prev.map(org => 
                org.id === orgId ? { ...org, isMember: true, members: (typeof org.members === 'number' ? org.members + 1 : org.members) } : org
            ));
        } else {
            // Handle non-JSON responses (like 404 HTML pages) to prevent crashes
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                
                // Gracefully handle "Already Member" error
                if (response.status === 400 && errorData.message && errorData.message.toLowerCase().includes("already a member")) {
                    alert("You are already a member of this organization.");
                    setOrganizations(prev => prev.map(org => 
                        org.id === orgId ? { ...org, isMember: true } : org
                    ));
                } else {
                    alert(errorData.message || "Failed to join organization.");
                }
            } else {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                alert(`Failed to join: ${response.status} ${response.statusText}\nDetails: ${errorText.slice(0, 200)}`);
            }
        }
    } catch (error) {
        console.error("Join error:", error);
        alert("An error occurred while trying to join.");
    } finally {
        setJoiningId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      <Sidebar activePage="Find Organization" />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Find Organizations
              </h1>
              <p className="text-slate-500 text-sm dark:text-slate-400 mt-1">
                Search for workspaces to join or create your own team.
              </p>
            </div>
            <button 
                onClick={() => navigate('/organizations/create')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all whitespace-nowrap"
            >
                <Plus size={18} />
                <span>Create New</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white dark:bg-slate-800 dark:border-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                  placeholder="Search organizations by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : organizations.length > 0 ? (
                organizations.map((org) => (
                    <div key={org.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-200 dark:hover:border-slate-600 transition-colors shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{org.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{org.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Users size={14} />
                                        <span>{org.members} members</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Globe size={14} />
                                        <span>{org.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            {org.isMember ? (
                                <button disabled className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 cursor-default">
                                    <CheckCircle size={16} />
                                    <span>Member</span>
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleJoin(org.id)}
                                    disabled={joiningId === org.id}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center"
                                >
                                    {joiningId === org.id ? <Loader2 size={16} className="animate-spin" /> : "Join"}
                                </button>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No organizations found</h3>
                    <p className="text-slate-500 dark:text-slate-400">Try adjusting your search terms.</p>
                </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}