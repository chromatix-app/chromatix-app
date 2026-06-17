// Generated using GitHub Copilot

import getDashSrc from './getDashSrc';

const TRACK_KEY = '/library/metadata/163407';
const SERVER_BASE_URL = 'https://192-168-1-201.abc123.plex.direct:32400';
const ACCESS_TOKEN = 'test-token-abc';

describe('Testing "getDashSrc" function', () => {
  test('Returns a valid DASH manifest URL', () => {
    const result = getDashSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN);
    expect(result).toContain(SERVER_BASE_URL);
    expect(result).toContain('/music/:/transcode/universal/start.mpd');
  });

  test('Encodes the track key as the path parameter', () => {
    const result = getDashSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN);
    expect(result).toContain(`path=${encodeURIComponent(TRACK_KEY)}`);
  });

  test('Includes required Plex DASH parameters', () => {
    const result = getDashSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN);
    expect(result).toContain('protocol=dash');
    expect(result).toContain('directPlay=0');
    expect(result).toContain('directStream=0');
    expect(result).toContain('directStreamAudio=0');
    expect(result).toContain('mediaIndex=0');
    expect(result).toContain('partIndex=0');
    expect(result).toContain('musicBitrate=320');
    expect(result).toContain('mediaBufferSize=12288');
  });

  test('Includes both client profile extra transcoding targets', () => {
    const result = getDashSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN);
    expect(result).toContain('X-Plex-Client-Profile-Extra');
    // DASH primary target
    expect(result).toContain('protocol%3Ddash');
    expect(result).toContain('container%3Dmp4');
    // HLS fallback target
    expect(result).toContain('protocol%3Dhls');
    expect(result).toContain('container%3Dmpegts');
    // Both use AAC
    expect(result).toContain('audioCodec%3Daac');
  });

  test('Includes the access token', () => {
    const result = getDashSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN);
    expect(result).toContain(`X-Plex-Token=${ACCESS_TOKEN}`);
  });

  test('Includes the client identifier', () => {
    const result = getDashSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN);
    expect(result).toContain('X-Plex-Client-Identifier=chromatix.app');
  });

  test('URL starts with the server base URL', () => {
    const result = getDashSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN);
    expect(result.startsWith(SERVER_BASE_URL)).toBe(true);
  });

  test('Does not include a session identifier (must be appended per-playback)', () => {
    const result = getDashSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN);
    expect(result).not.toContain('X-Plex-Session-Identifier');
  });
});
