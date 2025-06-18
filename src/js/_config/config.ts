export const config = {
  // dev - make store accessible in window object
  globalStore: true,

  // local storage keys
  storagePinKey: 'chromatix-pin-id',
  storageTokenKey: 'chromatix-auth-token',
  storagePersistentKey: 'chromatix-persist-v1',
  storageSessionKey: 'chromatix-session-v1',

  // session storage keys
  windowPosKey: 'chromatix-window-positions',
  contentPosKey: 'chromatix-content-positions',
};

const exports = { ...config };

export default exports;
