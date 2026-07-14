import getCastSrc from './getCastSrc';

const TRACK_KEY = '/library/metadata/163407';
const SERVER_BASE_URL = 'https://192-168-1-201.abc123.plex.direct:32400';
const ACCESS_TOKEN = 'test-token-abc';
const SESSION_ID = 'anmoezmv3vaq3roxwgz3h67f';

describe('Testing "getCastSrc" function', () => {
  test('Returns a progressive MP3 transcode URL', () => {
    const result = getCastSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN, SESSION_ID);
    expect(result).toContain(SERVER_BASE_URL);
    expect(result).toContain('/music/:/transcode/universal/start.mp3');
  });

  test('Encodes the track key as the path parameter', () => {
    const result = getCastSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN, SESSION_ID);
    expect(result).toContain(`path=${encodeURIComponent(TRACK_KEY)}`);
  });

  test('Includes required Plex transcode parameters', () => {
    const result = getCastSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN, SESSION_ID);
    expect(result).toContain('protocol=http');
    expect(result).toContain('directPlay=0');
    expect(result).toContain('directStream=0');
    expect(result).toContain('directStreamAudio=0');
    expect(result).toContain('mediaIndex=0');
    expect(result).toContain('partIndex=0');
    expect(result).toContain('musicBitrate=320');
  });

  test('Includes the MP3 client profile transcoding target', () => {
    const result = getCastSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN, SESSION_ID);
    expect(result).toContain('X-Plex-Client-Profile-Extra');
    expect(result).toContain('protocol%3Dhttp');
    expect(result).toContain('container%3Dmp3');
    expect(result).toContain('audioCodec%3Dmp3');
  });

  test('Includes the access token', () => {
    const result = getCastSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN, SESSION_ID);
    expect(result).toContain(`X-Plex-Token=${ACCESS_TOKEN}`);
  });

  test('Includes the client identifier', () => {
    const result = getCastSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN, SESSION_ID);
    expect(result).toContain('X-Plex-Client-Identifier=chromatix.app');
  });

  test('URL starts with the server base URL', () => {
    const result = getCastSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN, SESSION_ID);
    expect(result.startsWith(SERVER_BASE_URL)).toBe(true);
  });

  test('Includes the session identifier', () => {
    const result = getCastSrc(TRACK_KEY, SERVER_BASE_URL, ACCESS_TOKEN, SESSION_ID);
    expect(result).toContain(`X-Plex-Session-Identifier=${SESSION_ID}`);
  });
});
