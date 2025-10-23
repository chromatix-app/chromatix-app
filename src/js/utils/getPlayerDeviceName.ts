import { isElectron } from './environment';
import os from 'os';
import getBrowserName from './getBrowserName';

/**
 * Gets an appropriate device name to provide to the media provider
 * @returns The detected device name or 'Unknown'
 */
const getPlayerDeviceName = (): string => {
  let deviceName;

  if (isElectron) {
    deviceName = os.hostname();
  } else {
    deviceName = getBrowserName();
  }

  return deviceName ?? 'Unknown';
};

export default getPlayerDeviceName;
