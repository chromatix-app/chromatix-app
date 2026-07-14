import requiresCastTranscoding from './requiresCastTranscoding';

describe('Testing "requiresCastTranscoding" function', () => {
  test('Returns true for null or undefined codec', () => {
    expect(requiresCastTranscoding(null)).toBe(true);
    expect(requiresCastTranscoding(undefined)).toBe(true);
  });

  test('Returns false for codecs Chromecast can direct play', () => {
    expect(requiresCastTranscoding('mp3')).toBe(false);
    expect(requiresCastTranscoding('aac')).toBe(false);
    expect(requiresCastTranscoding('flac')).toBe(false);
    expect(requiresCastTranscoding('vorbis')).toBe(false);
    expect(requiresCastTranscoding('opus')).toBe(false);
    expect(requiresCastTranscoding('wav')).toBe(false);
  });

  test('Accepts raw PCM API values as WAV equivalents', () => {
    expect(requiresCastTranscoding('pcm')).toBe(false);
    expect(requiresCastTranscoding('pcm_s16le')).toBe(false);
    expect(requiresCastTranscoding('pcm_s24le')).toBe(false);
    expect(requiresCastTranscoding('pcm_f32le')).toBe(false);
  });

  test('Returns true for codecs Chromecast cannot direct play', () => {
    expect(requiresCastTranscoding('alac')).toBe(true);
    expect(requiresCastTranscoding('aiff')).toBe(true);
    expect(requiresCastTranscoding('wma')).toBe(true);
    expect(requiresCastTranscoding('wmav2')).toBe(true);
  });

  test('Returns true for completely unknown codecs', () => {
    expect(requiresCastTranscoding('ape')).toBe(true);
    expect(requiresCastTranscoding('dsd')).toBe(true);
    expect(requiresCastTranscoding('truehd')).toBe(true);
  });

  test('Is case-insensitive', () => {
    expect(requiresCastTranscoding('MP3')).toBe(false);
    expect(requiresCastTranscoding('FLAC')).toBe(false);
    expect(requiresCastTranscoding('ALAC')).toBe(true);
  });
});
