import { isElectron, electronPlatform } from './environment';

/**
 * Sends data to Electron main process via IPC if running in Electron environment.
 * @param platform - Target platform ('any' for all platforms, 'mac' for macOS, 'win' for Windows)
 * @param key - A custom key to identify the message
 * @param data - Data to send to main process
 */

const sendToElectron = (platform: 'any' | 'mac' | 'win' = 'any', key: string, data: any): void => {
  if (isElectron && (platform === 'any' || electronPlatform === platform) && window?.ipcRenderer) {
    window.ipcRenderer.send(key, data);
  }
};

export default sendToElectron;
