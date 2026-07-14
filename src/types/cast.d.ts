// Minimal ambient type declarations for the Google Cast Web Sender (CAF) SDK.
//
// The SDK is loaded at runtime from gstatic.com (see js/services/player.cast.ts)
// and attaches `cast` and `chrome.cast` globals to the window. Only the small
// surface Chromatix actually uses is declared here — kept in-repo instead of
// adding a @types/chromecast-caf-sender devDependency, since the tsconfig uses
// a closed "types" array and the full typings are far larger than our usage.
//
// Reference: https://developers.google.com/cast/docs/reference/web_sender

declare namespace chrome.cast {
  const AutoJoinPolicy: {
    ORIGIN_SCOPED: string;
    TAB_AND_ORIGIN_SCOPED: string;
    PAGE_SCOPED: string;
  };

  class Image {
    constructor(url: string);
    url: string;
  }

  class Volume {
    level: number | null;
    muted: boolean | null;
  }

  namespace media {
    const DEFAULT_MEDIA_RECEIVER_APP_ID: string;

    const StreamType: {
      BUFFERED: string;
      LIVE: string;
      OTHER: string;
    };

    const IdleReason: {
      CANCELLED: string;
      INTERRUPTED: string;
      FINISHED: string;
      ERROR: string;
    };

    class MusicTrackMediaMetadata {
      metadataType: number;
      title?: string;
      artist?: string;
      albumName?: string;
      trackNumber?: number;
      discNumber?: number;
      releaseDate?: string;
      images?: chrome.cast.Image[];
    }

    class MediaInfo {
      constructor(contentId: string, contentType: string);
      contentId: string;
      contentType: string;
      streamType: string;
      duration: number | null;
      metadata: unknown;
    }

    class LoadRequest {
      constructor(mediaInfo: MediaInfo);
      autoplay: boolean;
      currentTime: number;
    }

    class Media {
      idleReason: string | null;
      playerState: string;
    }
  }
}

declare namespace cast.framework {
  const VERSION: string;

  const CastContextEventType: {
    CAST_STATE_CHANGED: 'caststatechanged';
    SESSION_STATE_CHANGED: 'sessionstatechanged';
  };

  const CastState: {
    NO_DEVICES_AVAILABLE: string;
    NOT_CONNECTED: string;
    CONNECTING: string;
    CONNECTED: string;
  };

  const SessionState: {
    NO_SESSION: string;
    SESSION_STARTING: string;
    SESSION_STARTED: string;
    SESSION_START_FAILED: string;
    SESSION_ENDING: string;
    SESSION_ENDED: string;
    SESSION_RESUMED: string;
  };

  const RemotePlayerEventType: {
    ANY_CHANGE: string;
    IS_CONNECTED_CHANGED: string;
    IS_PAUSED_CHANGED: string;
    CURRENT_TIME_CHANGED: string;
    VOLUME_LEVEL_CHANGED: string;
    IS_MUTED_CHANGED: string;
    PLAYER_STATE_CHANGED: string;
  };

  interface CastStateEventData {
    castState: string;
  }

  interface SessionStateEventData {
    sessionState: string;
    session: CastSession | null;
  }

  interface CastDevice {
    friendlyName: string;
  }

  class CastSession {
    getCastDevice(): CastDevice;
    getMediaSession(): chrome.cast.media.Media | null;
    getVolume(): number | null;
    loadMedia(request: chrome.cast.media.LoadRequest): Promise<unknown>;
  }

  class CastContext {
    static getInstance(): CastContext;
    setOptions(options: { receiverApplicationId: string; autoJoinPolicy?: string }): void;
    getCastState(): string;
    getCurrentSession(): CastSession | null;
    requestSession(): Promise<unknown>;
    endCurrentSession(stopCasting: boolean): void;
    addEventListener(type: string, handler: (event: any) => void): void;
    removeEventListener(type: string, handler: (event: any) => void): void;
  }

  interface SavedPlayerState {
    mediaInfo: chrome.cast.media.MediaInfo | null;
    currentTime: number;
    isPaused: boolean;
  }

  class RemotePlayer {
    isConnected: boolean;
    isMediaLoaded: boolean;
    isPaused: boolean;
    isMuted: boolean;
    currentTime: number;
    duration: number;
    volumeLevel: number;
    playerState: string | null;
    savedPlayerState: SavedPlayerState | null;
  }

  class RemotePlayerController {
    constructor(player: RemotePlayer);
    addEventListener(type: string, handler: (event: { field: string; value: unknown }) => void): void;
    removeEventListener(type: string, handler: (event: { field: string; value: unknown }) => void): void;
    playOrPause(): void;
    stop(): void;
    seek(): void;
    setVolumeLevel(): void;
    muteOrUnmute(): void;
  }
}

declare interface Window {
  /** Callback invoked by the Cast sender SDK script once it has loaded. */
  __onGCastApiAvailable?: (available: boolean) => void;
}
