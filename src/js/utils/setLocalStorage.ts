import CryptoJS from 'crypto-js';

import config from 'js/_config/config';

const encryptionKey = config.encryptionKey;

/**
 * Sets an encrypted value in localStorage
 * @param key - The storage key
 * @param value - The value to encrypt and store
 */

const setLocalStorage = (key: string, value: string | number | boolean | object): void => {
  const stringValue: string = String(value);
  const encryptedValue: string = CryptoJS.AES.encrypt(stringValue, encryptionKey).toString();
  window.localStorage.setItem(key, encryptedValue);
};

export default setLocalStorage;
