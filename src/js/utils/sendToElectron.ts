import getEnvironment from './getEnvironment';

const envData = getEnvironment();

/**
 * Sends data to Electron main process via IPC if running in Electron environment.
 * @param platform - Target platform(s): 'any' for all, or one/more of 'mac' | 'win' | 'lin'
 * @param key - A custom key to identify the message
 * @param data - Data to send to main process
 */

const sendToElectron = (
  platform: 'any' | 'mac' | 'win' | 'lin' | ('mac' | 'win' | 'lin')[] = 'any',
  key: string,
  data: any
): void => {
  const platformMatches =
    platform === 'any' ||
    (Array.isArray(platform)
      ? platform.includes(envData.electronPlatformId as 'mac' | 'win' | 'lin')
      : envData.electronPlatformId === platform);
  if (envData.isElectron && platformMatches && window?.ipcRenderer) {
    window.ipcRenderer.send(key, data);
  }
};

export default sendToElectron;
