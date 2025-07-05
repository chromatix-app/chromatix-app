declare global {
  interface Window {
    isElectron?: boolean;
    electronProcess?: {
      platform?: string;
      appVersion?: string | null;
      buildDate?: string | null;
    };
    ipcRenderer?: {
      send: (key: string, data: any) => void;
      on: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
    };
    // umami: {
    //   track: (event: string, props: object) => void;
    // };
  }

  interface Navigator {
    standalone?: boolean;
  }
}

// Add this empty export to make this file a module
export {};
