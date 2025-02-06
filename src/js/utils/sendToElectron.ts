import { isElectron, electronPlatform } from './environment';

const sendToElectron = (platform: 'any' | string = 'any', key: string, data: any): void => {
  if (isElectron && (platform === 'any' || electronPlatform === platform) && window?.ipcRenderer) {
    window.ipcRenderer.send(key, data);
  }
};

export default sendToElectron;
