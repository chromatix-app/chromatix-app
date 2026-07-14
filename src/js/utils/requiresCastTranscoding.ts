// ======================================================================
// CHROMECAST CODEC SUPPORT TEST
// ======================================================================

// Codecs that Chromecast devices can direct play, per Google's supported
// media documentation. Chromecast Audio (and the Default Media Receiver)
// supports MP3, AAC (LC/HE), FLAC (up to 96kHz/24-bit), Vorbis, Opus and
// WAV/LPCM. Notably absent: ALAC, AIFF and WMA — those must be transcoded
// server-side before casting.
//
// Unlike requiresTranscoding (which probes the current browser via
// canPlayType), this is a static allowlist: the playback device is a remote
// Chromecast, so the sender browser's capabilities are irrelevant.
const CAST_COMPATIBLE_CODECS: ReadonlySet<string> = new Set([
  'mp3',
  'aac',
  'flac',
  'vorbis',
  'opus',
  'wav',
  // Raw PCM variants (little-endian WAV containers) — normalised to 'wav' by
  // the transpose layer, but accept the raw API values too, mirroring
  // requiresTranscoding's tolerance of both forms.
  'pcm',
  'pcm_s16le',
  'pcm_s24le',
  'pcm_s32le',
  'pcm_f32le',
]);

// ======================================================================
// EXPORTS
// ======================================================================

/**
 * Returns `true` if the given codec cannot be direct played by a Chromecast
 * device and must be transcoded server-side before casting. Falls back to
 * `true` (transcode) for any unknown or missing codec, to be safe.
 *
 * @param codec - A normalised or raw codec string (e.g. `"alac"`, `"mp3"`).
 */
export const requiresCastTranscoding = (codec: string | null | undefined): boolean => {
  if (!codec) return true;
  return !CAST_COMPATIBLE_CODECS.has(codec.toLowerCase());
};

export default requiresCastTranscoding;
