// Generated using GitHub Copilot

import requiresTranscoding, { _clearCache } from './playerCodec';

// playerCodec.ts creates its audio element via document.createElement('audio'),
// which in jsdom gives a native element distinct from our MockHTMLAudioElement.
// We must spy on that element's actual prototype to affect the module's singleton.
const nativeAudioProto = Object.getPrototypeOf(document.createElement('audio')) as HTMLAudioElement;

const mockCanPlayType = (result: '' | 'maybe' | 'probably') => {
  vi.spyOn(nativeAudioProto, 'canPlayType').mockReturnValue(result);
};

describe('Testing "requiresTranscoding" function', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    _clearCache();
  });

  test('Returns false for null or undefined codec', () => {
    expect(requiresTranscoding(null)).toBe(false);
    expect(requiresTranscoding(undefined)).toBe(false);
  });

  test('Returns true for completely unknown codecs not in the MIME map', () => {
    // canPlayType result is irrelevant — unknown codecs skip the check entirely
    mockCanPlayType('probably');
    expect(requiresTranscoding('ape')).toBe(true);
    expect(requiresTranscoding('dsd')).toBe(true);
    expect(requiresTranscoding('truehd')).toBe(true);
    expect(requiresTranscoding('dts')).toBe(true);
  });

  test('Returns false when canPlayType reports the codec as supported ("probably")', () => {
    // These codecs are all in the MIME map; whether the browser actually supports
    // them varies by browser. This test only verifies the routing logic.
    mockCanPlayType('probably');
    expect(requiresTranscoding('mp3')).toBe(false);
    expect(requiresTranscoding('aac')).toBe(false);
    expect(requiresTranscoding('flac')).toBe(false);
    expect(requiresTranscoding('alac')).toBe(false);
    expect(requiresTranscoding('opus')).toBe(false);
    expect(requiresTranscoding('vorbis')).toBe(false);
    expect(requiresTranscoding('wma')).toBe(false);
  });

  test('Returns false when canPlayType reports the codec as supported ("maybe")', () => {
    mockCanPlayType('maybe');
    expect(requiresTranscoding('mp3')).toBe(false);
    expect(requiresTranscoding('alac')).toBe(false);
  });

  test('Returns true when canPlayType reports the codec as unsupported ("")', () => {
    mockCanPlayType('');
    expect(requiresTranscoding('mp3')).toBe(true);
    expect(requiresTranscoding('aac')).toBe(true);
    expect(requiresTranscoding('flac')).toBe(true);
    expect(requiresTranscoding('alac')).toBe(true);
    expect(requiresTranscoding('opus')).toBe(true);
    expect(requiresTranscoding('vorbis')).toBe(true);
    expect(requiresTranscoding('wma')).toBe(true);
  });

  test('Is case-insensitive', () => {
    mockCanPlayType('probably');
    expect(requiresTranscoding('MP3')).toBe(false);
    expect(requiresTranscoding('ALAC')).toBe(false);

    _clearCache();
    mockCanPlayType('');
    expect(requiresTranscoding('MP3')).toBe(true);
    expect(requiresTranscoding('ALAC')).toBe(true);
  });

  test('Returns cached result without calling canPlayType again', () => {
    mockCanPlayType('probably');
    expect(requiresTranscoding('mp3')).toBe(false);

    // Change the mock — the cached result should still be returned.
    mockCanPlayType('');
    expect(requiresTranscoding('mp3')).toBe(false);
  });
});
