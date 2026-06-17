// ======================================================================
// IMPORTS
// ======================================================================

import getEnvironment from './getEnvironment';

// ======================================================================
// OPTIONS
// ======================================================================

// Tells Plex what to transcode to. Two targets joined with '+', matching the
// Plex web app: primary DASH/MP4/AAC, with an HLS/MPEGTS fallback.
const CLIENT_PROFILE_EXTRA =
  'add-transcode-target(type=musicProfile&context=streaming&protocol=dash&container=mp4&audioCodec=aac)' +
  '+add-transcode-target(type=musicProfile&context=streaming&protocol=hls&container=mpegts&audioCodec=aac,mp3)';

// ======================================================================
// EXPORTS
// ======================================================================

/**
 * Generates a Plex MPEG-DASH manifest URL for a track on the fly.
 * The URL targets Plex's universal transcoder, which converts any codec
 * to AAC in an MP4/DASH container for universal browser playback.
 *
 * @param trackKey - The Plex track metadata key (e.g. `"/library/metadata/163407"`).
 * @param serverBaseUrl - The active Plex server base URL (e.g. `"https://192-168-1-201.plex.direct:32400"`).
 * @param accessToken - The Plex access token for the current user.
 * @param sessionId - The Plex session identifier from `sessionModel.sessionId`.
 */
const getDashSrc = (trackKey: string, serverBaseUrl: string, accessToken: string, sessionId: string): string => {
  const envData = getEnvironment();

  const params = new URLSearchParams({
    hasMDE: '1',
    path: trackKey,
    mediaIndex: '0',
    partIndex: '0',
    musicBitrate: '320',
    directStreamAudio: '0',
    mediaBufferSize: '12288',
    protocol: 'dash',
    directPlay: '0',
    directStream: '0',
    'X-Plex-Client-Profile-Extra': CLIENT_PROFILE_EXTRA,
    'X-Plex-Product': envData.appName,
    // Plex's transcoder rejects DASH requests from non-web platform identifiers
    // (e.g. macOS, Windows). Always identify as Web here.
    'X-Plex-Platform': 'Web', //envData.appPlatformName,
    'X-Plex-Device-Name': envData.deviceName,
    'X-Plex-Client-Identifier': 'chromatix.app',
    'X-Plex-Token': accessToken,
    'X-Plex-Session-Identifier': sessionId,
  });

  return `${serverBaseUrl}/music/:/transcode/universal/start.mpd?${params.toString()}`;
};

export default getDashSrc;
