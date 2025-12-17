import { useState } from "react";
import { X, Building2, Globe, CheckCircle2, Server, Shield, MapPin, Mail, FileText, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createOrganization } from "../services/organizationService";

export default function AddOrganizationModal({ isOpen, onClose, onOrganizationAdded }) {
  // Enhanced Form State
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    adminEmail: "",
    region: "us-east-1",
    description: "",
    plan: "Pro",
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation Logic
  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Organization name is required";
    if (!formData.domain) newErrors.domain = "Domain is required";
    if (!formData.adminEmail) newErrors.adminEmail = "Admin email is required";
    // Simple regex for domain validation
    if (formData.domain && !/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(formData.domain)) {
        newErrors.domain = "Invalid domain format (e.g., example.com)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      const newOrg = await createOrganization(formData);
      onOrganizationAdded(newOrg);
      
      // Reset & Close
      setFormData({ name: "", domain: "", adminEmail: "", region: "us-east-1", description: "", plan: "Pro" });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to provision tenant:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({ label, icon: Icon, name, type = "text", placeholder, halfWidth }) => (
    <div className={`space-y-1.5 ${halfWidth ? 'col-span-1' : 'col-span-2'}`}>
      <div className="flex justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
            {label}
        </label>
        {errors[name] && <span className="text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle size={10} /> {errors[name]}</span>}
      </div>
      <div className="relative group">
        <Icon className={`absolute left-3 top-3.5 w-4 h-4 transition-colors ${errors[name] ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`} />
        <input 
          type={type}
          placeholder={placeholder}
          value={formData[name]}
          onChange={(e) => {
            setFormData({...formData, [name]: e.target.value});
            if (errors[name]) setErrors({...errors, [name]: null});
          }}
          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition-all ${
            errors[name] 
                ? 'border-rose-200 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-900/50' 
                : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
          }`}
        />
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-all"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg shadow-indigo-500/20">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Provision Tenant</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Initialize a new organization node</p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Form Content */}
              <div className="overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-5">
                    
                    <InputField 
                        label="Organization Name" 
                        name="name" 
                        icon={Building2} 
                        placeholder="e.g. Acme Corp Global" 
                    />

                    <InputField 
                        label="Primary Domain" 
                        name="domain" 
                        icon={Globe} 
                        placeholder="acme.com" 
                        halfWidth
                    />

                    {/* Region Selector (Compliance) */}
                    <div className="space-y-1.5 col-span-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                            Data Residency
                        </label>
                        <div className="relative group">
                            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <select
                                value={formData.region}
                                onChange={(e) => setFormData({...formData, region: e.target.value})}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                            >
                                <option value="us-east-1">US East (N. Virginia)</option>
                                <option value="eu-west-1">EU West (Ireland)</option>
                                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                            </select>
                        </div>
                    </div>

                    <InputField 
                        label="Admin Contact Email" 
                        name="adminEmail" 
                        icon={Mail} 
                        type="email"
                        placeholder="admin@acme.com" 
                    />

                    {/* Plan Selection */}
                    <div className="space-y-1.5 col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                            Allocation Tier
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Basic', 'Pro', 'Enterprise'].map((plan) => (
                            <button
                                key={plan}
                                type="button"
                                onClick={() => setFormData({...formData, plan})}
                                className={`py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                                formData.plan === plan 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/50 dark:text-indigo-300 ring-1 ring-indigo-500/20 shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
                                }`}
                            >
                                {plan === 'Enterprise' && <Server size={12} />}
                                {plan}
                            </button>
                            ))}
                        </div>
                    </div>

                    {/* Description Area */}
                    <div className="space-y-1.5 col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                            Internal Notes (Optional)
                        </label>
                        <div className="relative group">
                            <FileText className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <textarea 
                                rows={3}
                                placeholder="Add deployment context or constraints..."
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                            />
                        </div>
                    </div>

                </form>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shrink-0 flex gap-3">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-[2] py-3 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:bg-slate-800 dark:hover:bg-indigo-500 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {isSubmitting ? (
                    <>
                        <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        <span>Provisioning Node...</span>
                    </>
                    ) : (
                    <>
                        <CheckCircle2 size={16} />
                        <span>Confirm Deployment</span>
                    </>
                    )}
                </button>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}