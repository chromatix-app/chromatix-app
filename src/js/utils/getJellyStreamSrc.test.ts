// Tests generated using AI

import getJellyStreamSrc from './getJellyStreamSrc';

const SERVER_BASE_URL = 'https://jellyfin.example.com';
const DIRECT_SRC = `${SERVER_BASE_URL}/Audio/abc123/stream?static=true`;
const TRANSCODE_SRC = `${SERVER_BASE_URL}/Audio/abc123/universal?audioCodec=aac,mp3`;
const ACCESS_TOKEN = 'token123';

describe('Testing "getJellyStreamSrc" function', () => {
  test('Adds the token as both ApiKey and api_key', () => {
    const url = new URL(getJellyStreamSrc(DIRECT_SRC, ACCESS_TOKEN));
    expect(url.searchParams.get('ApiKey')).toBe(ACCESS_TOKEN);
    expect(url.searchParams.get('api_key')).toBe(ACCESS_TOKEN);
  });

  test('Keeps the existing path and params', () => {
    const directUrl = new URL(getJellyStreamSrc(DIRECT_SRC, ACCESS_TOKEN));
    expect(directUrl.origin + directUrl.pathname).toBe(`${SERVER_BASE_URL}/Audio/abc123/stream`);
    expect(directUrl.searchParams.get('static')).toBe('true');

    const transcodeUrl = new URL(getJellyStreamSrc(TRANSCODE_SRC, ACCESS_TOKEN));
    expect(transcodeUrl.origin + transcodeUrl.pathname).toBe(`${SERVER_BASE_URL}/Audio/abc123/universal`);
    expect(transcodeUrl.searchParams.get('audioCodec')).toBe('aac,mp3');
  });

  test('Replaces a stale token rather than adding a second one', () => {
    const staleSrc = `${DIRECT_SRC}&ApiKey=old&api_key=old`;
    const url = new URL(getJellyStreamSrc(staleSrc, ACCESS_TOKEN));
    expect(url.searchParams.getAll('ApiKey')).toEqual([ACCESS_TOKEN]);
    expect(url.searchParams.getAll('api_key')).toEqual([ACCESS_TOKEN]);
  });

  test('Throws on an invalid URL', () => {
    expect(() => getJellyStreamSrc('not a url', ACCESS_TOKEN)).toThrow();
  });
});
