import { getToken } from './auth';

// Mock user data - in a real app, this would come from the JWT token or API
const mockUserData = {
  admin: { role: 'Admin', permissions: ['read', 'write', 'delete', 'manage_users'] },
  manager: { role: 'Manager', permissions: ['read', 'write', 'manage_users'] },
  user: { role: 'User', permissions: ['read'] }
};

// Get current user role from token or localStorage
export const getCurrentUserRole = () => {
  // In a real implementation, decode the JWT token to get user role
  // For now, we'll use a mock approach
  const token = getToken();
  if (!token) return null;
  
  // Mock: simulate different user roles based on token content
  // In production, this would decode the actual JWT
  if (token.includes('admin')) return 'admin';
  if (token.includes('manager')) return 'manager';
  return 'user';
};

export const getCurrentUserPermissions = () => {
  const role = getCurrentUserRole();
  return role ? mockUserData[role].permissions : [];
};

export const hasPermission = (permission) => {
  const permissions = getCurrentUserPermissions();
  return permissions.includes(permission);
};

export const canManageUsers = () => {
  return hasPermission('manage_users');
};

export const canWrite = () => {
  return hasPermission('write');
};

export const canDelete = () => {
  return hasPermission('delete');
};

export const isAdmin = () => {
  return getCurrentUserRole() === 'admin';
};

export const isManager = () => {
  return getCurrentUserRole() === 'manager';
};

export const isClient = () => {
  return getCurrentUserRole() === 'user';
};
