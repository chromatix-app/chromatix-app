// ======================================================================
// IMPORTS
// ======================================================================

import type { CastInitParams, PlayerTrack } from 'types/player';
import getElectronDetails from 'js/utils/getElectronDetails';
import requiresCastTranscoding from 'js/utils/requiresCastTranscoding';

// ======================================================================
// OPTIONS
// ======================================================================

// The Google Cast Web Sender (CAF) SDK. Loaded lazily at init() so browsers
// without cast support (and the Electron app) never fetch it. The
// loadCastFramework flag makes the loader pull in the CAF framework
// (cast.framework.*) alongside the base chrome.cast API.
const CAST_SDK_URL = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';

// MIME types for codecs Chromecast can direct play, used as the contentType
// hint when loading media onto the receiver. Codecs absent from this map are
// server-side transcoded to MP3 before casting (see requiresCastTranscoding).
const CODEC_CONTENT_TYPES: Readonly<Record<string, string>> = {
  mp3: 'audio/mpeg',
  aac: 'audio/mp4',
  flac: 'audio/flac',
  vorbis: 'audio/ogg',
  opus: 'audio/ogg',
  wav: 'audio/wav',
  pcm: 'audio/wav',
  pcm_s16le: 'audio/wav',
  pcm_s24le: 'audio/wav',
  pcm_s32le: 'audio/wav',
  pcm_f32le: 'audio/wav',
};

// ======================================================================
// STATE
// ======================================================================

let castContext: cast.framework.CastContext | null = null;
let remotePlayer: cast.framework.RemotePlayer | null = null;
let remotePlayerController: cast.framework.RemotePlayerController | null = null;

// True once the SDK has loaded and the CastContext is initialised.
let supported = false;
// True while a cast session is active (started or resumed).
let connected = false;
// True when the receiver being IDLE is expected (nothing loaded yet, or we
// intentionally stopped playback) — suppresses IDLE-FINISHED ended handling.
let intendedIdle = true;
// Incremented on every loadTrack()/unload() so stale loadMedia() promise
// results from a superseded request can be ignored.
let loadCounter = 0;
// The last position (ms) reported by the remote player while connected.
// Read after disconnect, when the SDK has already torn the session down.
let lastKnownProgress = 0;

let callbacks: CastInitParams | null = null;

// ======================================================================
// INITIALISE
// ======================================================================

export const init = (params: CastInitParams): void => {
  callbacks = params;

  // The Cast sender SDK only functions in Chromium browsers with the Cast
  // extension API (Chrome/Edge). It signals availability via the
  // __onGCastApiAvailable callback, so it is safe to attempt everywhere —
  // except Electron, which has no Cast support and shouldn't fetch the script.
  if (getElectronDetails().isElectron) return;
  if (typeof document === 'undefined') return;

  window.__onGCastApiAvailable = (available: boolean) => {
    if (available) {
      initCastContext();
    }
  };

  const script = document.createElement('script');
  script.src = CAST_SDK_URL;
  script.async = true;
  // Load failures (offline, blocked CDN) simply leave casting unavailable.
  script.onerror = () => {
    console.warn('%c--- .cast - sender SDK failed to load; casting disabled ---', 'color:#e5a00d');
  };
  document.head.appendChild(script);
};

const initCastContext = (): void => {
  console.log('%c--- .cast - init ---', 'color:#e5a00d');

  castContext = cast.framework.CastContext.getInstance();
  castContext.setOptions({
    // The Default Media Receiver plays plain audio URLs with no custom
    // receiver app needing registration with Google.
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    // ORIGIN_SCOPED rejoins an in-progress session after a page reload.
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
  });

  supported = true;

  // Surface device availability so the UI can show/hide the cast button.
  castContext.addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, (event) => {
    const castState = (event as cast.framework.CastStateEventData).castState;
    callbacks?.onCastAvailability(castState !== cast.framework.CastState.NO_DEVICES_AVAILABLE);
  });
  // Handle devices already discovered before our listener attached.
  if (castContext.getCastState() !== cast.framework.CastState.NO_DEVICES_AVAILABLE) {
    callbacks?.onCastAvailability(true);
  }

  // Session lifecycle: connect / resume / disconnect.
  castContext.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event) => {
    const { sessionState, session } = event as cast.framework.SessionStateEventData;

    if (
      sessionState === cast.framework.SessionState.SESSION_STARTED ||
      sessionState === cast.framework.SessionState.SESSION_RESUMED
    ) {
      console.log('%c--- .cast - session ' + sessionState.toLowerCase() + ' ---', 'color:#e5a00d');
      connected = true;
      // A resumed session may already be playing media (page reload while
      // casting) — its natural end must still advance the queue.
      const remoteMediaLoaded = !!session?.getMediaSession();
      intendedIdle = !remoteMediaLoaded;
      lastKnownProgress = remoteMediaLoaded && remotePlayer ? remotePlayer.currentTime || 0 : 0;
      const deviceVolume = remotePlayer && remotePlayer.volumeLevel != null ? remotePlayer.volumeLevel * 100 : null;
      callbacks?.onCastConnect({
        deviceName: session?.getCastDevice()?.friendlyName || null,
        deviceVolume: deviceVolume != null ? Math.round(deviceVolume) : null,
        wasResumed: sessionState === cast.framework.SessionState.SESSION_RESUMED,
        remoteIsPaused: remotePlayer?.isPaused ?? false,
        remoteMediaLoaded,
      });
    }

    if (sessionState === cast.framework.SessionState.SESSION_ENDED) {
      console.log('%c--- .cast - session ended ---', 'color:#e5a00d');
      connected = false;
      intendedIdle = true;
      // savedPlayerState is populated by the SDK specifically so senders can
      // continue playback locally from where the receiver left off.
      const savedProgress = remotePlayer?.savedPlayerState?.currentTime;
      const progress = typeof savedProgress === 'number' && savedProgress > 0 ? savedProgress : lastKnownProgress;
      callbacks?.onCastDisconnect({ progress: progress * 1000 });
    }
  });

  remotePlayer = new cast.framework.RemotePlayer();
  remotePlayerController = new cast.framework.RemotePlayerController(remotePlayer);

  // Natural end of track: the receiver goes IDLE with reason FINISHED.
  // Loading the next track also passes through IDLE (reason INTERRUPTED), and
  // stop() produces CANCELLED — only FINISHED advances the queue.
  remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED, (event) => {
    if (!connected || intendedIdle) return;
    if (event.value === 'IDLE') {
      const idleReason = castContext?.getCurrentSession()?.getMediaSession()?.idleReason;
      if (idleReason === chrome.cast.media.IdleReason.FINISHED) {
        intendedIdle = true;
        callbacks?.onEnded();
      } else if (idleReason === chrome.cast.media.IdleReason.ERROR) {
        intendedIdle = true;
        callbacks?.onCastError({
          errorCode: 'CAST_MEDIA_ERROR',
          errorMessage: 'The cast device could not play the track',
        });
      }
    }
  });

  // Remote pause/resume (receiver button, Google Home app, another sender).
  remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED, () => {
    if (!connected || !remotePlayer) return;
    callbacks?.onCastRemotePause(remotePlayer.isPaused);
  });

  // Track progress so a position is available after the session tears down.
  remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, () => {
    if (!connected || !remotePlayer) return;
    if (remotePlayer.currentTime > 0) {
      lastKnownProgress = remotePlayer.currentTime;
    }
  });

  // Receiver volume changes (device buttons, Google Home app) sync back to
  // the app's volume slider.
  remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED, () => {
    if (!connected || !remotePlayer) return;
    callbacks?.onCastVolumeChange(Math.round(remotePlayer.volumeLevel * 100));
  });
};

// ======================================================================
// UNLOAD
// ======================================================================

export const unload = (): void => {
  if (!supported) return;
  loadCounter += 1;
  intendedIdle = true;
  // Stop remote media, keep the session alive: unload() fires on logout and
  // track-list changes, neither of which should disconnect the device.
  if (connected && remotePlayerController) {
    console.log('%c--- .cast - unload ---', 'color:#e5a00d');
    remotePlayerController.stop();
  }
};

// ======================================================================
// LOAD TRACK
// ======================================================================

/**
 * Load a track onto the connected cast device. Returns `false` when no
 * cast-playable source is available (e.g. a Plex track that needs transcoding
 * before its castSrc credentials are ready), mirroring the router contract.
 */
export const loadTrack = (track: PlayerTrack, progress: number = 0, play: boolean = true): boolean => {
  if (!supported || !connected) return false;

  const session = castContext?.getCurrentSession();
  if (!session) return false;

  // Chromecast-compatible codecs stream the original file; everything else
  // uses the server-side transcode URL computed by the store (withCastSrc).
  const needsTranscode = requiresCastTranscoding(track.codec);
  const src = needsTranscode ? track.castSrc : track.src;
  if (!src) return false;

  console.log('%c--- .cast - loadTrack ---', 'color:#e5a00d');

  const contentType = needsTranscode
    ? 'audio/mpeg'
    : CODEC_CONTENT_TYPES[track.codec?.toLowerCase() || ''] || 'audio/mpeg';

  const mediaInfo = new chrome.cast.media.MediaInfo(src, contentType);
  mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
  if (track.duration) {
    mediaInfo.duration = track.duration / 1000;
  }

  const metadata = new chrome.cast.media.MusicTrackMediaMetadata();
  metadata.title = track.title;
  metadata.artist = track.artist;
  metadata.albumName = track.album;
  if (track.trackNumber) {
    metadata.trackNumber = track.trackNumber;
  }
  if (track.discNumber) {
    metadata.discNumber = track.discNumber;
  }
  if (track.releaseDate) {
    metadata.releaseDate = track.releaseDate;
  }
  if (track.thumbMd) {
    // Artwork URLs embed the auth token as a query param, so the receiver
    // (which cannot send auth headers) can fetch them directly.
    metadata.images = [new chrome.cast.Image(track.thumbMd)];
  }
  mediaInfo.metadata = metadata;

  const request = new chrome.cast.media.LoadRequest(mediaInfo);
  request.autoplay = play;
  request.currentTime = progress > 0 ? progress / 1000 : 0;

  loadCounter += 1;
  const thisLoad = loadCounter;
  // Treat the receiver as intentionally idle until this load is confirmed —
  // a stale IDLE/FINISHED status from the track this load supersedes can
  // still arrive and must not double-advance the queue. A genuine FINISHED
  // for the new media cannot arrive before its loadMedia() resolves, so
  // end-of-track detection is re-armed there.
  intendedIdle = true;
  lastKnownProgress = progress / 1000;

  callbacks?.onLoadStart();
  session.loadMedia(request).then(
    () => {
      if (thisLoad !== loadCounter) return; // superseded by a newer load
      intendedIdle = false;
      callbacks?.onCanPlay();
    },
    (error: unknown) => {
      if (thisLoad !== loadCounter) return; // superseded by a newer load
      console.error('%c--- .cast - loadMedia error ---', 'color:#f00', error);
      intendedIdle = true;
      callbacks?.onCastError({
        errorCode: typeof error === 'string' ? error : 'LOAD_MEDIA_FAILED',
        errorMessage: 'The cast device could not load the track',
      });
    }
  );

  return true;
};

// ======================================================================
// PLAYBACK CONTROLS
// ======================================================================

export const pause = (): void => {
  if (connected && remotePlayer && remotePlayerController && !remotePlayer.isPaused) {
    remotePlayerController.playOrPause();
  }
};

export const resume = (): void => {
  if (connected && remotePlayer && remotePlayerController && remotePlayer.isPaused) {
    remotePlayerController.playOrPause();
  }
};

export const restart = (): void => {
  if (connected && remotePlayer && remotePlayerController) {
    remotePlayer.currentTime = 0;
    remotePlayerController.seek();
    resume();
  }
};

// ======================================================================
// VOLUME
// ======================================================================

export const setVolume = (volumeLevel: number): void => {
  if (connected && remotePlayer && remotePlayerController) {
    remotePlayer.volumeLevel = volumeLevel / 100;
    remotePlayerController.setVolumeLevel();
  }
};

// ======================================================================
// PROGRESS
// ======================================================================

export const setProgress = (progress: number): void => {
  if (connected && remotePlayer && remotePlayerController) {
    remotePlayer.currentTime = progress / 1000;
    remotePlayerController.seek();
  }
};

export const getCurrentProgress = (): number => {
  if (connected && remotePlayer) {
    return remotePlayer.currentTime || 0;
  }
  return 0;
};

// ======================================================================
// SESSION CONTROLS
// ======================================================================

/**
 * Open the browser's cast device picker. When a session is already active the
 * same dialog offers "Stop casting", so a single entry point covers both.
 */
export const requestCastSession = (): void => {
  if (!supported || !castContext) return;
  castContext.requestSession().catch((error: unknown) => {
    // 'cancel' is the user closing the picker — not an error.
    if (error === 'cancel') return;
    console.warn('%c--- .cast - requestSession error ---', 'color:#e5a00d', error);
  });
};

/** End the current cast session (used on logout). */
export const endCastSession = (): void => {
  if (supported && connected && castContext) {
    castContext.endCurrentSession(true);
  }
};

// ======================================================================
// HELPERS
// ======================================================================

export const isConnected = (): boolean => connected;

/** True when the connected receiver already has media loaded. */
export const isMediaLoaded = (): boolean => {
  return !!(connected && remotePlayer && remotePlayer.isMediaLoaded);
};

/** The receiver's current volume (0-100), or null when not connected. */
export const getVolume = (): number | null => {
  if (connected && remotePlayer && remotePlayer.volumeLevel != null) {
    return Math.round(remotePlayer.volumeLevel * 100);
  }
  return null;
};
