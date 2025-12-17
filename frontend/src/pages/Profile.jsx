import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Building, Calendar, 
  Clock, Edit2, Save, X, Camera, Briefcase, 
  Shield, CheckCircle2, BadgeCheck, Hash, Globe 
} from 'lucide-react';
import { getAuthHeaders } from "../lib/auth";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Default Data aligned with Enterprise Theme
  const [profileData, setProfileData] = useState({
    firstName: 'Rence',
    lastName: 'Fernandez',
    email: 'rence@secureoms.com',
    phone: '+63 (912) 345-6789',
    location: 'Albay, Philippines',
    department: 'Cybersecurity Ops',
    role: 'Penetration Tester',
    employeeId: 'OMS-8821-X',
    clearance: 'Level 4 (Top Secret)',
    bio: 'Specialist in network vulnerability assessment and secure infrastructure deployment.',
    joinedDate: '2023-11-15',
    lastActive: new Date().toISOString(),
    profilePicture: null
  });
  
  const [editedData, setEditedData] = useState({ ...profileData });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const currentUserEmail = localStorage.getItem('userEmail');
    if (!currentUserEmail) return;

    // Check if we have profile data for this specific user
    const profileKey = `userProfile_${currentUserEmail}`;
    const savedData = localStorage.getItem(profileKey);
    
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Ensure the email matches the current user
      if (parsed.email === currentUserEmail) {
        setProfileData(parsed);
        setEditedData(parsed);
      } else {
        // Data doesn't match current user, clear it and use defaults
        localStorage.removeItem(profileKey);
        const defaultData = {
          email: currentUserEmail,
          firstName: '',
          lastName: '',
          phone: '',
          bio: '',
          profilePicture: null
        };
        setProfileData(defaultData);
        setEditedData(defaultData);
      }
    } else {
      // No saved data for this user, create default profile
      const defaultData = {
        email: currentUserEmail,
        firstName: '',
        lastName: '',
        phone: '',
        bio: '',
        profilePicture: null,
        location: null
      };
      setProfileData(defaultData);
      setEditedData(defaultData);
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({ ...profileData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({ ...profileData });
    setNotification(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
        const userId = localStorage.getItem('userId');
        // Combine names for backend compatibility (since backend uses 'name')
        const payload = {
            ...editedData,
            name: `${editedData.firstName} ${editedData.lastName}`.trim()
        };

        const res = await fetch(`http://127.0.0.1:3000/api/users/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setProfileData({ ...editedData });
            setIsEditing(false);
            
            // Update localStorage to keep UI in sync immediately
            const currentUserEmail = localStorage.getItem('userEmail');
            if (currentUserEmail) {
                const profileKey = `userProfile_${currentUserEmail}`;
                localStorage.setItem(profileKey, JSON.stringify(editedData));
            }
            showNotification('success', 'Profile record updated successfully.');
        } else {
            showNotification('error', 'Failed to save profile to database.');
        }
    } catch (error) {
        console.error(error);
        showNotification('error', 'Network error. Could not save.');
    } finally {
        setIsLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showNotification('error', 'Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get address from coordinates using reverse geocoding
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();
          
          const locationString = data.locality ? 
            `${data.locality}, ${data.principalSubdivision}, ${data.countryName}` :
            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          setEditedData(prev => ({ ...prev, location: locationString }));
          showNotification('success', 'Location detected and added to profile');
        } catch (error) {
          // Fallback to coordinates if geocoding fails
          setEditedData(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
          showNotification('success', 'Location coordinates added to profile');
        }
        setIsLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        showNotification('error', errorMessage);
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="text-indigo-600 dark:text-indigo-400" />
                User Configuration
            </h1>
            <p className="text-slate-500 text-sm dark:text-slate-400 mt-1">Manage personal identity and access credentials.</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
            <AnimatePresence mode='wait'>
                {isEditing ? (
                    <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex gap-2"
                    >
                        <button 
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-70 transition-all"
                        >
                            {isLoading ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"/> : <Save size={16} />}
                            Save Changes
                        </button>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:shadow-indigo-500/20 transition-all"
                    >
                        <Edit2 size={16} />
                        Edit Profile
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-24 right-8 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl shadow-lg dark:bg-emerald-900/80 dark:border-emerald-800 dark:text-emerald-300 backdrop-blur-md"
            >
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">{notification.message}</span>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Left Column: Identity Card --- */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10 dark:opacity-20"></div>
                
                <div className="relative flex flex-col items-center">
                    {/* Avatar */}
                    <div className="relative mb-4 group/avatar">
                        <div className="w-32 h-32 rounded-full p-1 bg-white dark:bg-slate-800 ring-2 ring-indigo-100 dark:ring-indigo-500/30 overflow-hidden relative">
                            {(editedData.profilePicture || profileData.profilePicture) ? (
                                <img 
                                    src={editedData.profilePicture || profileData.profilePicture} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-3xl">
                                    {profileData.firstName[0]}{profileData.lastName[0]}
                                </div>
                            )}
                            
                            {/* Edit Overlay */}
                            {isEditing && (
                                <label className="absolute inset-0 bg-slate-900/50 flex items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                    <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" />
                                </label>
                            )}
                        </div>
                        {/* Status Dot */}
                        <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-800 rounded-full" title="Online"></div>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {editedData.firstName} {editedData.lastName}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">
                        {editedData.role}
                    </p>

                    <div className="w-full grid grid-cols-2 gap-2 text-center text-xs border-t border-slate-100 dark:border-slate-700 pt-4">
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Joined</p>
                            <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{new Date(profileData.joinedDate).toLocaleDateString()}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Clearance</p>
                            <p className="font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">Level 4</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Metadata</h3>
                
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <Hash size={16} className="text-slate-400" />
                        <span>Employee ID</span>
                    </div>
                    <span className="font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">
                        {profileData.employeeId}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <Clock size={16} className="text-slate-400" />
                        <span>Last Synced</span>
                    </div>
                    <span className="text-slate-900 dark:text-white text-xs">
                        Just now
                    </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <BadgeCheck size={16} className="text-slate-400" />
                        <span>Verification</span>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                        Verified <CheckCircle2 size={12} />
                    </span>
                </div>
            </div>
        </div>

        {/* --- Right Column: Edit Forms --- */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <SectionContainer title="Personal Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileField 
                        label="First Name" 
                        value={editedData.firstName} 
                        isEditing={isEditing}
                        onChange={(val) => handleInputChange('firstName', val)}
                        icon={User}
                    />
                    <ProfileField 
                        label="Last Name" 
                        value={editedData.lastName} 
                        isEditing={isEditing}
                        onChange={(val) => handleInputChange('lastName', val)}
                        icon={User}
                    />
                    <ProfileField 
                        label="Email Address" 
                        value={editedData.email} 
                        isEditing={isEditing}
                        onChange={(val) => handleInputChange('email', val)}
                        icon={Mail}
                        type="email"
                    />
                    <ProfileField 
                        label="Phone Number" 
                        value={editedData.phone} 
                        isEditing={isEditing}
                        onChange={(val) => handleInputChange('phone', val)}
                        icon={Phone}
                    />
                    <div className="md:col-span-2">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <MapPin /> Physical Location
                            </label>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={editedData.location || ''}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        placeholder="City, Country or coordinates"
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        disabled={isLoading}
                                        className="px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-xl transition-colors dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/20 disabled:opacity-50"
                                        title="Get current location"
                                    >
                                        <Globe size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white font-medium">
                                    {editedData.location || 'Not specified'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SectionContainer>

            {/* Organizational Details */}
            <SectionContainer title="Organizational Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileField 
                        label="Department" 
                        value={editedData.department} 
                        isEditing={isEditing}
                        onChange={(val) => handleInputChange('department', val)}
                        icon={Building}
                    />
                    <ProfileField 
                        label="Role / Title" 
                        value={editedData.role} 
                        isEditing={isEditing}
                        onChange={(val) => handleInputChange('role', val)}
                        icon={Briefcase}
                    />
                    <div className="md:col-span-2">
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <FileTextIcon /> Bio / Notes
                            </label>
                            {isEditing ? (
                                <textarea
                                    rows={4}
                                    value={editedData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white resize-none"
                                />
                            ) : (
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm leading-relaxed dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-300">
                                    {profileData.bio}
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </SectionContainer>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const SectionContainer = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-700">
            {title}
        </h3>
        {children}
    </div>
);

const ProfileField = ({ label, value, onChange, isEditing, icon: Icon, type = "text" }) => (
    <div className="space-y-2 group">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400">
            {Icon && <Icon size={14} />} {label}
        </label>
        {isEditing ? (
            <input 
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white font-medium"
            />
        ) : (
            <div className="px-4 py-2.5 rounded-xl bg-white border border-transparent text-slate-900 font-medium dark:bg-slate-800 dark:text-slate-200 truncate">
                {value}
            </div>
        )}
    </div>
);

// Helper Icon
const FileTextIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);

export default Profile;