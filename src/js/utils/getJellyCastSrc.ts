// ======================================================================
// IMPORTS
// ======================================================================

import getEnvironment from './getEnvironment';

// ======================================================================
// EXPORTS
// ======================================================================

/**
 * Generates a Jellyfin universal-endpoint URL that transcodes a track to a
 * progressive MP3 stream, for playback on a Chromecast device.
 *
 * Unlike the in-browser universal URL built by jellyTranspose (which lets the
 * server pick its default transcode target), this pins the target to
 * progressive MP3 — the format every Chromecast can play without the CORS
 * requirements that adaptive protocols impose. The token and device id are
 * query params because the receiver fetches the URL itself and cannot send
 * auth headers; a stable deviceId lets the server stop stale transcodes when
 * the next track starts.
 *
 * @param trackId - The Jellyfin track item id.
 * @param serverBaseUrl - The active Jellyfin server base URL.
 * @param accessToken - The Jellyfin access token for the current user.
 */
const getJellyCastSrc = (trackId: string, serverBaseUrl: string, accessToken: string): string => {
  const envData = getEnvironment();

  const params = new URLSearchParams({
    api_key: accessToken,
    deviceId: envData.deviceId,
    audioCodec: 'mp3',
    transcodingContainer: 'mp3',
    transcodingProtocol: 'http',
    maxStreamingBitrate: '320000',
  });

  return `${serverBaseUrl}/Audio/${trackId}/universal?${params.toString()}`;
};

export default getJellyCastSrc;
