import getJellyCastSrc from './getJellyCastSrc';

const TRACK_ID = 'f4c1d9a2b3e8c7d6a5b4c3d2e1f0a9b8';
const SERVER_BASE_URL = 'https://jellyfin.example.com';
const ACCESS_TOKEN = 'test-token-abc';

describe('Testing "getJellyCastSrc" function', () => {
  test('Returns a universal endpoint URL for the track', () => {
    const result = getJellyCastSrc(TRACK_ID, SERVER_BASE_URL, ACCESS_TOKEN);
    expect(result).toContain(SERVER_BASE_URL);
    expect(result).toContain(`/Audio/${TRACK_ID}/universal`);
  });

  test('Pins the transcode target to progressive MP3', () => {
    const result = getJellyCastSrc(TRACK_ID, SERVER_BASE_URL, ACCESS_TOKEN);
    expect(result).toContain('audioCodec=mp3');
    expect(result).toContain('transcodingContainer=mp3');
    expect(result).toContain('transcodingProtocol=http');
    expect(result).toContain('maxStreamingBitrate=320000');
  });

  test('Authenticates via query params (the receiver cannot send headers)', () => {
    const result = getJellyCastSrc(TRACK_ID, SERVER_BASE_URL, ACCESS_TOKEN);
    expect(result).toContain(`api_key=${ACCESS_TOKEN}`);
    expect(result).toContain('deviceId=');
  });

  test('URL starts with the server base URL', () => {
    const result = getJellyCastSrc(TRACK_ID, SERVER_BASE_URL, ACCESS_TOKEN);
    expect(result.startsWith(SERVER_BASE_URL)).toBe(true);
  });
});
