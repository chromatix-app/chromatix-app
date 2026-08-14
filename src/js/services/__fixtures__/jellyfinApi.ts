// Generated using Claude Code

// Raw Jellyfin API response payloads for use in tests, shaped exactly as the
// axios responses ({ data: ... }) that jellyTools.js passes to jellyTranspose.js.
// Field names and values mirror real Jellyfin 10.x server output; fields not
// read by the transpose functions are included sparingly to prove they are ignored.

// ======================================================================
// USER — /Users/{userId}
// ======================================================================

export const JELLY_USER_RESPONSE = {
  data: {
    Name: 'demo-user',
    ServerId: 'server-1',
    Id: 'user-1',
    PrimaryImageTag: 'usertag123',
    HasPassword: true,
  },
};

export const JELLY_USER_NO_IMAGE_RESPONSE = {
  data: {
    Name: 'imageless-user',
    ServerId: 'server-1',
    Id: 'user-2',
    HasPassword: true,
  },
};

// ======================================================================
// SERVER — /System/Info
// ======================================================================

export const JELLY_SERVER_RESPONSE = {
  data: {
    Id: 'server-1',
    ServerName: 'Home Media',
    Version: '10.10.3',
    OperatingSystem: 'Linux',
    LocalAddress: 'http://192.168.1.20:8096',
    StartupWizardCompleted: true,
  },
};

export const JELLY_SERVER_UNNAMED_RESPONSE = {
  data: {
    Id: 'server-2',
    Version: '10.10.3',
  },
};

// ======================================================================
// LIBRARIES — /Users/{userId}/Views
// ======================================================================

export const JELLY_LIBRARIES_RESPONSE = {
  data: {
    Items: [
      { Id: 'library-1', Name: 'Music', CollectionType: 'music', Type: 'CollectionFolder' },
      { Id: 'library-2', Name: 'Movies', CollectionType: 'movies', Type: 'CollectionFolder' },
      { Id: 'library-3', Name: 'Playlists', CollectionType: 'playlists', Type: 'CollectionFolder' },
    ],
    TotalRecordCount: 3,
    StartIndex: 0,
  },
};

// ======================================================================
// ARTISTS — /Artists, /Artists/AlbumArtists
// ======================================================================

// Has both a Primary image and a Backdrop — Primary must win.
export const JELLY_ARTIST_PRIMARY = {
  Id: 'artist-1',
  Name: 'The Midnight Owls',
  Type: 'MusicArtist',
  Genres: ['Indie Rock', 'Shoegaze'],
  UserData: { PlaybackPositionTicks: 0, PlayCount: 42, IsFavorite: true, Played: true },
  ImageTags: { Primary: 'artistprimary1' },
  BackdropImageTags: ['artistbackdrop1'],
};

// No Primary image — falls back to the first Backdrop; no UserData or Genres.
export const JELLY_ARTIST_BACKDROP = {
  Id: 'artist-2',
  Name: 'Vera Lane',
  Type: 'MusicArtist',
  BackdropImageTags: ['artistbackdrop2'],
};

export const JELLY_ARTISTS_RESPONSE = {
  data: {
    Items: [JELLY_ARTIST_PRIMARY, JELLY_ARTIST_BACKDROP],
    TotalRecordCount: 2,
    StartIndex: 0,
  },
};

// ======================================================================
// ALBUMS — /Items?IncludeItemTypes=MusicAlbum
// ======================================================================

// AlbumArtists contains an entry matching AlbumArtist by name (second in the
// list) — the matching entry must be picked over the first one.
export const JELLY_ALBUM_MAIN = {
  Id: 'album-1',
  Name: 'Nocturnal Songs',
  Type: 'MusicAlbum',
  AlbumArtist: 'The Midnight Owls',
  AlbumArtists: [
    { Id: 'artist-2', Name: 'Vera Lane' },
    { Id: 'artist-1', Name: 'The Midnight Owls' },
  ],
  Genres: ['Indie Rock'],
  PremiereDate: '2019-03-15T00:00:00.0000000Z',
  ProductionYear: 2019,
  UserData: { PlaybackPositionTicks: 0, PlayCount: 7, IsFavorite: true, Played: true },
  ImageTags: { Primary: 'albumprimary1' },
};

// AlbumArtist name matches none of the AlbumArtists entries — first entry wins.
const JELLY_ALBUM_NO_MATCHING_ARTIST = {
  Id: 'album-2',
  Name: 'Various Hits',
  Type: 'MusicAlbum',
  AlbumArtist: 'Various Artists',
  AlbumArtists: [{ Id: 'artist-3', Name: 'Nina Field' }],
  ImageTags: { Primary: 'albumprimary2' },
};

// No AlbumArtists, UserData, or images at all.
const JELLY_ALBUM_MINIMAL = {
  Id: 'album-3',
  Name: 'Demo Tapes',
  Type: 'MusicAlbum',
};

export const JELLY_ALBUMS_RESPONSE = {
  data: {
    Items: [JELLY_ALBUM_MAIN, JELLY_ALBUM_NO_MATCHING_ARTIST, JELLY_ALBUM_MINIMAL],
    TotalRecordCount: 3,
    StartIndex: 0,
  },
};

// ======================================================================
// PLAYLISTS — /Users/{userId}/Items?IncludeItemTypes=Playlist
// ======================================================================

export const JELLY_PLAYLIST_MAIN = {
  Id: 'playlist-1',
  Name: 'Late Night Drive',
  Type: 'Playlist',
  ChildCount: 24,
  RunTimeTicks: 54000000000,
  UserData: { PlaybackPositionTicks: 0, PlayCount: 3, IsFavorite: true, Played: false },
  ImageTags: { Primary: 'playlistprimary1' },
};

export const JELLY_PLAYLISTS_RESPONSE = {
  data: {
    Items: [JELLY_PLAYLIST_MAIN],
    TotalRecordCount: 1,
    StartIndex: 0,
  },
};

// ======================================================================
// TRACKS — /Users/{userId}/Items?IncludeItemTypes=Audio
// ======================================================================

// A fully-populated track. The EmbeddedImage stream is listed first to prove
// the transpose picks the stream with Type 'Audio', not simply the first one.
// AlbumArtists contains the matching artist second so name matching (not
// first-entry fallback) is exercised. Has both its own Primary image and an
// AlbumPrimaryImageTag — its own Primary must win.
export const JELLY_TRACK_FLAC = {
  Id: 'track-1',
  Name: 'City Lights',
  Type: 'Audio',
  Album: 'Nocturnal Songs',
  AlbumId: 'album-1',
  AlbumArtist: 'The Midnight Owls',
  AlbumArtists: [
    { Id: 'artist-2', Name: 'Vera Lane' },
    { Id: 'artist-1', Name: 'The Midnight Owls' },
  ],
  AlbumPrimaryImageTag: 'albumprimary1',
  ImageTags: { Primary: 'trackprimary1' },
  IndexNumber: 3,
  ParentIndexNumber: 1,
  PlaylistItemId: 'playlistitem-77',
  PremiereDate: '2019-03-15T00:00:00.0000000Z',
  RunTimeTicks: 2160000000,
  UserData: { PlaybackPositionTicks: 0, PlayCount: 12, IsFavorite: true, Played: true },
  MediaStreams: [
    { Codec: 'mjpeg', Type: 'EmbeddedImage', Index: 1 },
    { Codec: 'flac', Type: 'Audio', Index: 0, BitRate: 1411213, SampleRate: 44100, Channels: 2, BitDepth: 16 },
  ],
};

// Windows Media Audio track — raw codec 'wmav2'; BitRate rounds up to 193 kbps.
export const JELLY_TRACK_WMA = {
  Id: 'track-2',
  Name: 'Old Archive',
  Type: 'Audio',
  Album: 'Various Hits',
  AlbumId: 'album-2',
  AlbumArtist: 'Various Artists',
  AlbumArtists: [{ Id: 'artist-3', Name: 'Nina Field' }],
  IndexNumber: 1,
  ParentIndexNumber: 1,
  RunTimeTicks: 1800000000,
  UserData: { PlaybackPositionTicks: 0, PlayCount: 0, IsFavorite: false, Played: false },
  MediaStreams: [{ Codec: 'wmav2', Type: 'Audio', Index: 0, BitRate: 192500, SampleRate: 44100, Channels: 2 }],
};

// A track with the bare minimum of fields — no album, artists, images,
// media streams, user data, or runtime.
export const JELLY_TRACK_MINIMAL = {
  Id: 'track-3',
  Name: 'Untitled',
  Type: 'Audio',
};

// No own images — thumb falls back to the album's Primary image (AlbumId + AlbumPrimaryImageTag).
export const JELLY_TRACK_ALBUM_ART = {
  Id: 'track-4',
  Name: 'Harbour',
  Type: 'Audio',
  AlbumId: 'album-1',
  AlbumPrimaryImageTag: 'albumprimary1',
};

// No Primary images anywhere — thumb falls back to the track's own first Backdrop.
export const JELLY_TRACK_BACKDROP = {
  Id: 'track-5',
  Name: 'Overcast',
  Type: 'Audio',
  AlbumId: 'album-1',
  BackdropImageTags: ['trackbackdrop5'],
};

// No images on the track itself — thumb falls back to the album's first Backdrop
// (AlbumId + ParentBackdropImageTags).
export const JELLY_TRACK_PARENT_BACKDROP = {
  Id: 'track-6',
  Name: 'Seaglass',
  Type: 'Audio',
  AlbumId: 'album-1',
  ParentBackdropImageTags: ['parentbackdrop1'],
};

// ======================================================================
// SEARCH — /Items?searchTerm=...
// ======================================================================

// Deliberately out of order, with two entries per sortable dimension:
// results must be sorted by type (artist, album, playlist, track) and then
// by title within a type. The 'Genre' entry is an unsupported type and must
// be dropped. 'Alpine Air' has both ParentId and AlbumId (ParentId wins);
// 'Zebra Crossing' has only AlbumId (fallback).
export const JELLY_SEARCH_RESPONSE = {
  data: {
    Items: [
      { Id: 'track-20', Name: 'Zebra Crossing', Type: 'Audio', AlbumId: 'album-20' },
      { Id: 'artist-21', Name: 'Beta Waves', Type: 'MusicArtist', ImageTags: { Primary: 'searchartist21' } },
      { Id: 'playlist-22', Name: 'Morning Mix', Type: 'Playlist' },
      { Id: 'track-23', Name: 'Alpine Air', Type: 'Audio', ParentId: 'album-23', AlbumId: 'album-99' },
      { Id: 'album-24', Name: 'Basement Sessions', Type: 'MusicAlbum' },
      { Id: 'artist-25', Name: 'Alpha Court', Type: 'MusicArtist' },
      { Id: 'genre-26', Name: 'Ambient', Type: 'Genre' },
    ],
    TotalRecordCount: 7,
    StartIndex: 0,
  },
};
