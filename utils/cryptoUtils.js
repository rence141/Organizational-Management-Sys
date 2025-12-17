import CryptoJS from 'crypto-js';

// 1. Existing function (keep this)
export const generateEncryptedAccountId = ({ email, firstName, lastName }) => {
  const rawString = `${email}-${firstName}-${lastName}-${Date.now()}`;
  return `ACC-${CryptoJS.MD5(rawString).toString().substring(0, 12).toUpperCase()}`;
};

// 2. ✅ ADD THIS MISSING FUNCTION
export const generateUserId = () => {
  // Generates a random ID like "user_x9s8d7f"
  return 'user_' + Math.random().toString(36).substring(2, 9);
};