// Generated using Claude Code

// A small fake track list matching the internal normalised track shape.
// Only the fields read by models.player.js are included. No trackKey is set,
// so the Plex DASH helper (withDashSrc) leaves each track untouched and
// playerX.loadTrack receives these exact objects.
export const TRACKS = [
  {
    trackId: 'track-1',
    title: 'Track One',
    artist: 'Artist One',
    src: 'https://server.local/tracks/1.mp3',
    codec: 'mp3',
  },
  {
    trackId: 'track-2',
    title: 'Track Two',
    artist: 'Artist One',
    src: 'https://server.local/tracks/2.mp3',
    codec: 'mp3',
  },
  {
    trackId: 'track-3',
    title: 'Track Three',
    artist: 'Artist Two',
    src: 'https://server.local/tracks/3.mp3',
    codec: 'mp3',
  },
  {
    trackId: 'track-4',
    title: 'Track Four',
    artist: 'Artist Two',
    src: 'https://server.local/tracks/4.mp3',
    codec: 'mp3',
  },
  {
    trackId: 'track-5',
    title: 'Track Five',
    artist: 'Artist Three',
    src: 'https://server.local/tracks/5.mp3',
    codec: 'mp3',
  },
];

// Baseline "queue loaded, idle at track 0" playing state — spread into
// sessionModel.setSessionState and overridden per test.
export const basePlayingSession = {
  playingTrackList: TRACKS,
  playingTrackKeys: [0, 1, 2, 3, 4],
  playingTrackIndex: 0,
  playingTrackCount: TRACKS.length,
  playingTrackProgress: 0,
  playingOrder: null,
  playingRepeatAll: false,
  playingRepeatOnce: false,
  playingShuffle: false,
  volumeLevel: 50,
  volumeMuted: false,
};
