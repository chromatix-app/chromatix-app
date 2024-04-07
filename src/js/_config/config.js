export const config = {
  // dev - make store accessible in window object
  globalStore: true,

  // localstorage
  persistentStoreId: 'chromatix-persist-v1',
  sessionStoreId: 'chromatix-session-v1',
};

const exports = { ...config };

export default exports;
