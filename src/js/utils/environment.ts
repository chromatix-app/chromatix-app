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
  }
}

export const isElectron = window?.isElectron ? true : false;

export let electronPlatform: string | null = null;
export let electronVersion: string | null = null;
export let electronBuildDate: string | null = null;

export let appPlatform = 'web';

const expectedPlatforms = ['mac', 'win'];

if (isElectron && window?.electronProcess?.platform) {
  electronPlatform = window.electronProcess.platform;
  // backwards compatibility
  if (!expectedPlatforms.includes(electronPlatform)) {
    electronPlatform = electronPlatform === 'darwin' ? 'mac' : 'win';
  }
  appPlatform = electronPlatform;
}

if (isElectron && window?.electronProcess?.appVersion) {
  electronVersion = window.electronProcess.appVersion;
}

if (isElectron && window?.electronProcess?.buildDate) {
  electronBuildDate = window.electronProcess.buildDate;
}
