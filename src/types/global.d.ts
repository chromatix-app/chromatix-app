declare global {
  interface Window {
    isElectron?: boolean;
    electronProcess?: {
      platform?: string;
      appVersion?: string | null;
      buildDate?: string | null;
    };
    ipcRenderer: {
      send: (key: string, data: any) => void;
    };
    umami: {
      track: (event: string, props: object) => void;
    };
  }
}

// Add this empty export to make this file a module
export {};
