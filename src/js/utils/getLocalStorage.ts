import CryptoJS from 'crypto-js';

import config from 'js/_config/config';

const encryptionKey = config.encryptionKey;

/**
 * Gets and decrypts a value from localStorage
 * @param key - The storage key to retrieve
 * @returns The decrypted value as a string, or null if not found
 */

const getLocalStorage = (key: string): string | null => {
  const encryptedValue: string | null = window.localStorage.getItem(key);
  if (encryptedValue) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedValue, encryptionKey);
      const decryptedValue: string = bytes.toString(CryptoJS.enc.Utf8);
      return decryptedValue;
    } catch {
      return '';
    }
  }
  return null;
};

export default getLocalStorage;
