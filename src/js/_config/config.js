export const config = {
  // dev - make store accessible in window object
  globalStore: true,

  // localstorage
  storagePinKey: 'chromatix-pin-id',
  storageTokenKey: 'chromatix-auth-token',
  persistentStoreId: 'chromatix-persist-v1',
  sessionStoreId: 'chromatix-session-v1',
};

const exports = { ...config };

export default exports;
