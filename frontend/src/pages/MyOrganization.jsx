import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Building2, Globe, Mail, MapPin, Server, Calendar, ArrowLeft, Loader2, Settings, Save, X, Activity, ShieldCheck, Users, Megaphone, CalendarDays, UserMinus, ChevronUp, Plus, MoreVertical, User, UserCheck, Shield } from "lucide-react";
import { getToken, getAuthHeaders } from "../lib/auth"; // ✅ Import getAuthHeaders

export default function MyOrganizationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', domain: '', adminEmail: '', region: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [openMenuId, setOpenMenuId] = useState(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleMenuClick = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };
  
  // New State for Actions
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [eventForm, setEventForm] = useState({ title: '', date: '', description: '' });

  useEffect(() => {
    const fetchOrgDetails = async () => {
      try {
        // ✅ Use helper for headers
        const res = await fetch(`http://127.0.0.1:3000/api/organizations/${id}`, {
            headers: getAuthHeaders()
        });

        if (res.ok) {
            const data = await res.json();
            const foundOrg = data.data || data;
            
            if (foundOrg) setOrganization(foundOrg);
            else setError("Organization not found.");
        } else {
            setError("Failed to load organization.");
        }
      } catch (err) { setError("Server connection failed."); } 
      finally { setLoading(false); }
    };
    if (id) fetchOrgDetails();
  }, [id]);

  const handleEditClick = () => {
    setEditForm({ name: organization.name, domain: organization.domain, adminEmail: organization.adminEmail, region: organization.region });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const orgId = organization._id || organization.id;
      
      // ✅ Use helper for headers
      // ✅ Correct Endpoint: /api/organizations/:id
      const res = await fetch(`http://127.0.0.1:3000/api/organizations/${orgId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        const updated = await res.json();
        setOrganization(updated.data || updated);
        setIsEditing(false);
        alert("Updated successfully!");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update");
      }
    } catch (err) { alert("Server error"); } 
    finally { setSaving(false); }
  };

  // --- Action Handlers ---
  const handlePromote = async (userId, role) => {
    if(!confirm(`Promote this user to ${role}?`)) return;
    try {
        const res = await fetch(`http://127.0.0.1:3000/api/organizations/${organization._id}/promote`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId, role })
        });
        if(res.ok) {
            const data = await res.json();
            setOrganization(data.data);
        }
    } catch(e) { alert("Action failed"); }
  };

  const handleKick = async (userId) => {
    if(!confirm("Are you sure you want to remove this member?")) return;
    try {
        const res = await fetch(`http://127.0.0.1:3000/api/organizations/${organization._id}/kick`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId })
        });
        if(res.ok) {
            setOrganization(prev => ({
                ...prev,
                members: prev.members.filter(m => m._id !== userId)
            }));
        }
    } catch(e) { alert("Action failed"); }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    try {
        const userName = localStorage.getItem('userName') || 'Admin';
        const res = await fetch(`http://127.0.0.1:3000/api/organizations/${organization._id}/announce`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ ...announcementForm, author: userName })
        });
        if(res.ok) {
            const data = await res.json();
            setOrganization(data.data);
            setAnnouncementForm({ title: '', content: '' });
            alert("Announcement posted!");
        }
    } catch(e) { alert("Failed to post"); }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`http://127.0.0.1:3000/api/organizations/${organization._id}/events`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(eventForm)
        });
        if(res.ok) {
            const data = await res.json();
            setOrganization(data.data);
            setEventForm({ title: '', date: '', description: '' });
            alert("Event created!");
        }
    } catch(e) { alert("Failed to create event"); }
  };

  const currentUserId = localStorage.getItem('userId');
  const isOwner = organization && (organization.owner_ID === currentUserId);
  const isCoOwner = organization && organization.coOwners?.includes(currentUserId);
  const isOfficer = organization && organization.officers?.includes(currentUserId);
  const canManage = isOwner || isCoOwner;

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  
  if (error || !organization) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error || "Not found"}</p>
        <button onClick={() => navigate('/organizations')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Back</button>
    </div>
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen dark:bg-slate-900 dark:text-slate-100">
      <button onClick={() => navigate('/organizations')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6"><ArrowLeft size={16} /> Back</button>
      
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{organization.name}</h1>
            <p className="text-slate-500 text-sm">ID: <span className="font-mono">{organization._id || organization.id}</span></p>
        </div>
        <div className="flex gap-2">
            {canManage && (
                <button onClick={handleEditClick} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Settings size={16} /> Edit</button>
            )}
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"><Activity size={14} /> {organization.health || 0}%</span>
        </div>
      </div>

      {/* --- Stats Row --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-xs uppercase font-bold">Members</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{organization.members?.length || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20"><Users size={20} /></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-xs uppercase font-bold">Announcements</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{organization.announcements?.length || 0}</p>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg dark:bg-orange-900/20"><Megaphone size={20} /></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-xs uppercase font-bold">Events</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{organization.events?.length || 0}</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg dark:bg-purple-900/20"><CalendarDays size={20} /></div>
        </div>
      </div>

      {/* --- Tabs --- */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 mb-6">
        {['overview', 'members', 'announcements', 'events'].map(tab => (
            <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                {tab}
            </button>
        ))}
      </div>

      {/* --- Tab Content --- */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <DetailItem icon={Globe} label="Domain" value={organization.domain} />
            <DetailItem icon={Mail} label="Admin Email" value={organization.adminEmail} />
            <DetailItem icon={MapPin} label="Region" value={organization.region} />
            <DetailItem icon={Calendar} label="Created" value={new Date(organization.createdAt).toLocaleDateString()} />
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-visible">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-3 first:rounded-tl-xl">Name</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3 last:rounded-tr-xl">Role</th>
                        {(canManage) && <th className="px-6 py-3 text-right last:rounded-tr-xl">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {organization.members?.filter(m => m).map(member => {
                        const mId = member._id || member;
                        const displayName = member.name || 
                                          (member.firstName ? `${member.firstName} ${member.lastName || ''}`.trim() : null) || 
                                          member.email || 'User';
                        const mRole = organization.owner_ID === mId ? 'Owner' : 
                                      organization.coOwners?.includes(mId) ? 'Co-Owner' : 
                                      organization.officers?.includes(mId) ? 'Officer' : 'Member';
                        
                        // Determine if current user can act on this row
                        const canAct = isOwner || (isCoOwner && mRole !== 'Co-Owner');

                        return (
                            <tr key={mId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{displayName}</td>
                                <td className="px-6 py-3 text-slate-500">{member.email}</td>
                                <td className="px-6 py-3"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium">{mRole}</span></td>
                                {(canManage && mRole !== 'Owner' && canAct) && (
                                    <td className="px-6 py-3 text-right relative">
                                        <button onClick={(e) => handleMenuClick(e, mId)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                                            <MoreVertical size={16} />
                                        </button>
                                        
                                        {openMenuId === mId && (
                                            <div className="absolute right-8 top-8 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden text-left">
                                                {isOwner && (
                                                    <>
                                                        <button onClick={() => handlePromote(mId, 'co-owner')} className="w-full px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                                            <Shield size={14} /> Make Co-Owner
                                                        </button>
                                                        <button onClick={() => handlePromote(mId, 'officer')} className="w-full px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                                            <UserCheck size={14} /> Make Officer
                                                        </button>
                                                        <button onClick={() => handlePromote(mId, 'member')} className="w-full px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                                            <User size={14} /> Demote to Member
                                                        </button>
                                                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                                                    </>
                                                )}
                                                
                                                {(isOwner || (isCoOwner && (mRole === 'Member' || mRole === 'Officer'))) && (
                                                    <button onClick={() => handleKick(mId)} className="w-full px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400">
                                                        <UserMinus size={14} /> Remove Member
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-6">
            {(canManage || isOfficer) && (
                <form onSubmit={handlePostAnnouncement} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold mb-3 text-sm uppercase text-slate-500">New Announcement</h3>
                    <input required value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} placeholder="Title" className="w-full mb-2 p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                    <textarea required value={announcementForm.content} onChange={e => setAnnouncementForm({...announcementForm, content: e.target.value})} placeholder="Message..." className="w-full mb-2 p-2 border rounded dark:bg-slate-700 dark:border-slate-600" rows="2"></textarea>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Post</button>
                </form>
            )}
            <div className="space-y-4">
                {organization.announcements?.map((ann, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">{ann.title}</h4>
                            <span className="text-xs text-slate-500">{new Date(ann.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">{ann.content}</p>
                        <p className="text-xs text-slate-400 mt-3">Posted by {ann.author || 'Admin'}</p>
                    </div>
                ))}
                {(!organization.announcements || organization.announcements.length === 0) && <p className="text-slate-500 text-center py-8">No announcements yet.</p>}
            </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-6">
             {(canManage || isOfficer) && (
                <form onSubmit={handleCreateEvent} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-2 items-end">
                    <div className="flex-1"><label className="text-xs font-bold text-slate-500">Event Title</label><input required value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /></div>
                    <div className="w-40"><label className="text-xs font-bold text-slate-500">Date</label><input type="date" required value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /></div>
                    <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium h-10">Add Event</button>
                </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organization.events?.map((evt, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="bg-purple-50 text-purple-600 p-3 rounded-lg text-center min-w-[60px] dark:bg-purple-900/20">
                            <span className="block text-xs font-bold uppercase">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="block text-xl font-bold">{new Date(evt.date).getDate()}</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{evt.title}</h4>
                            <p className="text-sm text-slate-500">{evt.description || 'No description'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl border dark:border-slate-700">
            <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold dark:text-white">Edit Organization</h3>
                <button onClick={() => setIsEditing(false)}><X className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
                <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Name" />
                <input value={editForm.domain} onChange={e => setEditForm({...editForm, domain: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Domain" />
                <input value={editForm.adminEmail} onChange={e => setEditForm({...editForm, adminEmail: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Email" />
                <select value={editForm.region} onChange={e => setEditForm({...editForm, region: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600">
                    <option value="">Select Region</option>
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="eu-west-1">EU West (Ireland)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                </select>
            </div>
            <div className="flex gap-2 mt-6">
                <button onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded">Cancel</button>
                <button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
    return (
        <div className="flex gap-3 items-center">
            <div className="text-slate-400"><Icon size={20} /></div>
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase">{label}</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{value || "N/A"}</p>
            </div>
        </div>
    );
}