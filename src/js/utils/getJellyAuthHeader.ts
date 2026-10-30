interface JellyAuthDetails {
  client: string;
  device: string;
  deviceId: string;
  version?: string | null;
  token?: string | null;
}

/**
 * Builds the value of the standard Jellyfin `Authorization` header (`MediaBrowser` scheme). Values
 * are URL-encoded and quoted, as Jellyfin decodes them, so quotes or commas can't break the header.
 * The token is omitted when not provided (e.g. when logging in).
 */

const getJellyAuthHeader = ({ client, device, deviceId, version, token }: JellyAuthDetails): string => {
  const parts: [string, string][] = [
    ['Client', client],
    ['Device', device],
    ['DeviceId', deviceId],
    ['Version', version || '0.0.0'],
  ];

  if (token) {
    parts.push(['Token', token]);
  }

  return 'MediaBrowser ' + parts.map(([key, value]) => `${key}="${encodeURIComponent(value)}"`).join(', ');
};

export default getJellyAuthHeader;
