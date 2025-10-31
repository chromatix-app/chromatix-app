/**
 * Detects the user's operating system name based on the user agent string
 * @returns {string} The detected operating system name or 'Unknown'
 */

const getOperatingSystemName = (): string => {
  const userAgent: string = navigator.userAgent;

  if (userAgent.includes('Windows')) {
    return 'Windows';
  } else if (userAgent.includes('Mac OS X')) {
    return 'macOS';
  } else if (userAgent.includes('Linux')) {
    return 'Linux';
  } else if (userAgent.includes('Android')) {
    return 'Android';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod')) {
    return 'iOS';
  } else {
    return 'Unknown';
  }
};

export default getOperatingSystemName;
