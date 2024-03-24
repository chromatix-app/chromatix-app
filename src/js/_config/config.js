const config = {
  // dev - make store accessible in window object
  globalStore: true,

  // localstorage
  persistentStoreId: 'rsk-persist-v1',
  sessionStoreId: 'rsk-session-v1',
};

const exports = { ...config };

export default exports;
