// ======================================================================
// IMPORTS
// ======================================================================

import getEnvironment from './getEnvironment';

// ======================================================================
// OPTIONS
// ======================================================================

// Tells Plex what to transcode to: a single progressive HTTP/MP3 target.
// Chromecast devices play progressive streams without the CORS requirements
// that adaptive protocols (DASH/HLS) impose on the media server, so plain
// MP3 over HTTP is the most reliable cast transcode format.
const CLIENT_PROFILE_EXTRA =
  'add-transcode-target(type=musicProfile&context=streaming&protocol=http&container=mp3&audioCodec=mp3)';

// ======================================================================
// EXPORTS
// ======================================================================

/**
 * Generates a Plex progressive MP3 transcode URL for a track, for playback
 * on a Chromecast device. The URL targets Plex's universal transcoder, which
 * converts any codec to a plain MP3 stream that Chromecast can play directly.
 *
 * Mirrors getDashSrc (used for in-browser transcoding), but requests a
 * progressive HTTP/MP3 stream instead of a DASH manifest, because the
 * receiver fetches the URL itself and cannot be relied upon to satisfy
 * DASH's CORS requirements against a Plex server.
 *
 * @param trackKey - The Plex track metadata key (e.g. `"/library/metadata/163407"`).
 * @param serverBaseUrl - The active Plex server base URL (e.g. `"https://192-168-1-201.plex.direct:32400"`).
 * @param accessToken - The Plex access token for the current user.
 * @param sessionId - The Plex session identifier from `sessionModel.sessionId`.
 */
const getCastSrc = (trackKey: string, serverBaseUrl: string, accessToken: string, sessionId: string): string => {
  const envData = getEnvironment();

  const params = new URLSearchParams({
    hasMDE: '1',
    path: trackKey,
    mediaIndex: '0',
    partIndex: '0',
    musicBitrate: '320',
    directStreamAudio: '0',
    mediaBufferSize: '12288',
    protocol: 'http',
    directPlay: '0',
    directStream: '0',
    'X-Plex-Client-Profile-Extra': CLIENT_PROFILE_EXTRA,
    'X-Plex-Product': envData.appName,
    // Plex's transcoder rejects requests from non-web platform identifiers
    // (e.g. macOS, Windows). Always identify as Web here, matching getDashSrc.
    'X-Plex-Platform': 'Web',
    'X-Plex-Device-Name': envData.deviceName,
    'X-Plex-Client-Identifier': 'chromatix.app',
    'X-Plex-Token': accessToken,
    'X-Plex-Session-Identifier': sessionId,
  });

  return `${serverBaseUrl}/music/:/transcode/universal/start.mp3?${params.toString()}`;
};

export default getCastSrc;
