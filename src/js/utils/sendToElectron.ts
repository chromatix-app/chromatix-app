declare global {
  interface Window {
    ipcRenderer: {
      send: (key: string, data: any) => void;
    };
  }
}

const isElectron = window?.isElectron;
const electronPlatform = isElectron ? (window?.electronProcess?.platform === 'darwin' ? 'mac' : 'win') : null;

const sendToElectron = (platform: 'any' | string = 'any', key: string, data: any): void => {
  if (isElectron && (platform === 'any' || electronPlatform === platform) && window?.ipcRenderer) {
    window.ipcRenderer.send(key, data);
  }
};

export default sendToElectron;
