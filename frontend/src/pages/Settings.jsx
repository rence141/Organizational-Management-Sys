import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Bell, Shield, Database, Globe, Palette, Moon, Sun, Mail, Lock, Smartphone, Monitor, CheckCircle, AlertCircle, Download, Trash2, RefreshCcw, Accessibility, Megaphone } from "lucide-react";
import { getSettings, updateSettings, exportSettings } from "../services/settingsService";
import { useTheme } from "../contexts/ThemeContext";

export default function SettingsPage() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    siteName: "Organization Management System",
    siteUrl: "https://oms.example.com",
    adminEmail: "admin@example.com",
    timezone: "UTC-5",
    language: "English",
    emailNotifications: true,
    pushNotifications: false,
    twoFactorAuth: true,
    sessionTimeout: "30",
    backupFrequency: "daily",
    logRetention: "90",
    reducedMotion: false,
    marketingEmails: false,
  });

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await getSettings();
        setFormData(settings);
        if (settings.timezone) localStorage.setItem('appTimezone', settings.timezone);
        if (settings.reducedMotion !== undefined) localStorage.setItem('reducedMotion', settings.reducedMotion);
        if (settings.backupFrequency) localStorage.setItem('backupFrequency', settings.backupFrequency);
        if (settings.logRetention) localStorage.setItem('logRetention', settings.logRetention);
      } catch (err) {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const tabs = [
    { id: "general", name: "General", icon: Settings },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "system", name: "System", icon: Database },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      
      console.log('Saving settings:', formData);
      await updateSettings(formData);
      localStorage.setItem('appTimezone', formData.timezone);
      localStorage.setItem('reducedMotion', formData.reducedMotion);
      localStorage.setItem('backupFrequency', formData.backupFrequency);
      localStorage.setItem('logRetention', formData.logRetention);
      console.log('Settings saved successfully');
      setSuccess("Settings saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      setError("");
      setSuccess("");
      
      const result = await exportSettings();
      setSuccess(result.message);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to export settings");
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings to default?")) {
      setSuccess("Settings reset to defaults.");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleDeleteAccount = () => {
    const confirmDelete = window.prompt("Type 'DELETE' to confirm account deletion:");
    if (confirmDelete === "DELETE") {
      alert("Account deletion request processed.");
      // In a real app, call delete API here
    }
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Palette size={20} />
          Appearance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg dark:border-slate-600">
            <div className="flex items-center gap-3">
              {isDark ? <Moon size={20} className="text-slate-600 dark:text-slate-400" /> : <Sun size={20} className="text-slate-600 dark:text-slate-400" />}
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Dark Mode</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Toggle dark/light theme</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDark ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDark ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Monitor size={20} />
          Regional Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Timezone</label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            >
              <option value="UTC-8">UTC-8 (PST)</option>
              <option value="UTC-5">UTC-5 (EST)</option>
              <option value="UTC+0">UTC (GMT)</option>
              <option value="UTC+1">UTC+1 (CET)</option>
              <option value="UTC+8">UTC+8 (CST)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Language</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Chinese">Chinese</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Accessibility size={20} />
          Accessibility
        </h3>
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg dark:border-slate-600">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">Reduced Motion</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Minimize animations across the interface</p>
          </div>
          <input
            type="checkbox"
            name="reducedMotion"
            checked={formData.reducedMotion}
            onChange={handleInputChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded dark:border-slate-600 dark:focus:ring-indigo-400"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Mail size={20} />
          Email Notifications
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg dark:border-slate-600">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Email Notifications</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Receive email alerts for system events</p>
            </div>
            <input
              type="checkbox"
              name="emailNotifications"
              checked={formData.emailNotifications}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded dark:border-slate-600 dark:focus:ring-indigo-400"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Megaphone size={20} />
          Marketing & Updates
        </h3>
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg dark:border-slate-600">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">Product Updates</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Receive news about new features and improvements</p>
          </div>
          <input
            type="checkbox"
            name="marketingEmails"
            checked={formData.marketingEmails}
            onChange={handleInputChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded dark:border-slate-600 dark:focus:ring-indigo-400"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Smartphone size={20} />
          Push Notifications
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg dark:border-slate-600">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Push Notifications</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Receive push notifications on mobile devices</p>
            </div>
            <input
              type="checkbox"
              name="pushNotifications"
              checked={formData.pushNotifications}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded dark:border-slate-600 dark:focus:ring-indigo-400"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Lock size={20} />
          Authentication
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg dark:border-slate-600">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Two-Factor Authentication</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Require 2FA for all admin accounts</p>
            </div>
            <input
              type="checkbox"
              name="twoFactorAuth"
              checked={formData.twoFactorAuth}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded dark:border-slate-600 dark:focus:ring-indigo-400"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Session Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Session Timeout (minutes)</label>
            <input
              type="number"
              name="sessionTimeout"
              value={formData.sessionTimeout}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Database size={20} />
          Data Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Backup Frequency</label>
            <select
              name="backupFrequency"
              value={formData.backupFrequency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Log Retention (days)</label>
            <input
              type="number"
              name="logRetention"
              value={formData.logRetention}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle size={20} />
          Danger Zone
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10 dark:border-red-800">
            <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">Reset Settings</h4>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">Restore all configuration to default values.</p>
            <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors dark:bg-slate-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-slate-700">
              <RefreshCcw size={16} /> Reset Defaults
            </button>
          </div>
          <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10 dark:border-red-800">
            <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">Delete Account</h4>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">Permanently delete your account and all data.</p>
            <button onClick={handleDeleteAccount} className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general": return renderGeneralTab();
      case "notifications": return renderNotificationsTab();
      case "security": return renderSecurityTab();
      case "system": return renderSystemTab();
      default: return renderGeneralTab();
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen dark:bg-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-slate-500 text-sm dark:text-slate-400">Manage system configuration and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-indigo-200 transition-all dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300">{success}</span>
        </div>
      )}

      {/* Debug Info - Remove in production */}
      <div className="bg-slate-100 p-3 rounded-lg dark:bg-slate-800">
        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          Debug: Current settings - {JSON.stringify(formData, null, 2)}
        </p>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 dark:bg-slate-800 dark:border-slate-700">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <Icon size={18} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 dark:bg-slate-800 dark:border-slate-700">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: formData.reducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: formData.reducedMotion ? 0 : 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
