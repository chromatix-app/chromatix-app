import CryptoJS from 'crypto-js';

import config from 'js/_config/config';

const encryptionKey = config.encryptionKey;
const storagePayloadPrefix = '__chromatix__:';

/**
 * Sets an encrypted value in localStorage
 * @param key - The storage key
 * @param value - The value to encrypt and store
 */

const setLocalStorage = (key: string, value: string | number | boolean | object): void => {
  const stringValue: string = typeof value === 'object' ? JSON.stringify(value) : String(value);
  const payload: string = `${storagePayloadPrefix}${stringValue}`;
  const encryptedValue: string = CryptoJS.AES.encrypt(payload, encryptionKey).toString();
  window.localStorage.setItem(key, encryptedValue);
};

export default setLocalStorage;
