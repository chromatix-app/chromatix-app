export const config = {
  // dev - make store accessible in window object
  globalStore: true,

  // local storage keys
  storageJellyServerKey: 'chromatix-jelly-server',
  storageJellyUserKey: 'chromatix-jelly-user',
  storagePersistentKey: 'chromatix-persist-v1',
  storagePinKey: 'chromatix-pin-id',
  storageServiceKey: 'chromatix-service',
  storageSessionKey: 'chromatix-session-v1',
  storageTokenKey: 'chromatix-auth-token',

  // session storage keys
  contentPosKey: 'chromatix-content-positions',
  windowPosKey: 'chromatix-window-positions',

  // encryption keys
  encryptionKey: 'your_secret_key_here',
};

const exports = { ...config };

export default exports;
