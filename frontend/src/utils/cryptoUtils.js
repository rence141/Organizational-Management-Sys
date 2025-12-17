// src/utils/cryptoUtils.js
import CryptoJS from 'crypto-js';

// Simple hashing for non-critical ID generation (like Account IDs)
export const generateEncryptedAccountId = ({ email, firstName, lastName }) => {
  const rawString = `${email}-${firstName}-${lastName}-${Date.now()}`;
  // Generate a short hash (first 12 chars)
  const hash = CryptoJS.MD5(rawString).toString().substring(0, 12).toUpperCase();
  return `ACC-${hash}`;
};

// If you don't want to install crypto-js, use this simple fallback:
/*
export const generateEncryptedAccountId = ({ email, firstName }) => {
  const random = Math.floor(Math.random() * 10000);
  return `ACC-${firstName.toUpperCase().substring(0,3)}-${random}`;
};
*/