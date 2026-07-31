// ======================================================================
// CODEC SUPPORT TEST
// ======================================================================

// A single audio element used for canPlayType checks — created once at module load.
const _audioEl = typeof document !== 'undefined' ? document.createElement('audio') : null;

// Maps normalised codec display names (and common raw API values) to MIME type
// strings used for canPlayType testing. Presence in this map does NOT mean the
// codec is universally supported — it means we have a MIME type to probe.
// canPlayType returns '' when the browser can't play it (transcoding required)
// and 'maybe'/'probably' when it can (native playback). Codecs absent from
// this map are assumed to always require transcoding.
const CODEC_MIME_MAP: Readonly<Record<string, string>> = {
  mp3: 'audio/mpeg',
  aac: 'audio/aac',
  flac: 'audio/flac',
  aiff: 'audio/x-aiff',
  alac: 'audio/mp4; codecs="alac"',
  vorbis: 'audio/ogg; codecs="vorbis"',
  opus: 'audio/ogg; codecs="opus"',
  pcm: 'audio/wav',
  pcm_s16le: 'audio/wav',
  pcm_s24le: 'audio/wav',
  pcm_f32le: 'audio/wav',
  wav: 'audio/wav',
  wma: 'audio/x-ms-wma',
  wmav2: 'audio/x-ms-wma',
  wmapro: 'audio/x-ms-wma',
};

// ======================================================================
// EXPORTS
// ======================================================================

// canPlayType returns the same result for the same MIME type for the lifetime
// of the page, so cache the result per codec to avoid repeated DOM calls.
const _cache = new Map<string, boolean>();

/**
 * Returns `true` if the given codec cannot be played natively by the current
 * browser. Used by Jellyfin to choose the universal transcoding endpoint, and
 * by Plex to decide whether to load via DASH. Falls back to `true` (transcode)
 * for any unknown codec. Accepts both normalised display names (`"wav"`, `"wma"`)
 * and raw API values (`"pcm_s16le"`, `"wmav2"`).
 *
 * Returns `true` for a missing/null codec (unknown format — transcode to be safe).
 * Returns `false` when no audio element is available (non-DOM environment — unreachable
 * in production; assuming native avoids transcoding every codec in that state).
 *
 * @param codec - A normalised or raw codec string (e.g. `"alac"`, `"mp3"`).
 */
export const requiresTranscoding = (codec: string | null | undefined): boolean => {
  if (!codec) return true;
  if (!_audioEl) return false;
  const key = codec.toLowerCase();
  if (_cache.has(key)) return _cache.get(key)!;
  const mime = CODEC_MIME_MAP[key];
  const result = mime ? _audioEl.canPlayType(mime) === '' : true;
  _cache.set(key, result);
  return result;
};

/** Clears the canPlayType result cache. Exposed for unit tests only. */
export const _clearCache = (): void => _cache.clear();

export default requiresTranscoding;
