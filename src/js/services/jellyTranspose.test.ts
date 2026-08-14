// Generated using Claude Code

import { _clearCache } from 'js/utils/requiresTranscoding';

import {
  transposeUserData,
  transposeServerData,
  transposeLibraryArray,
  transposeArtistArray,
  transposeAlbumArtistArray,
  transposeArtistDetails,
  transposeAlbumArray,
  transposeAlbumDetails,
  transposePlaylistArray,
  transposePlaylistDetails,
  transposeTagArray,
  transposeTrackArray,
  transposeSearchResultsArray,
} from './jellyTranspose';

import {
  JELLY_USER_RESPONSE,
  JELLY_USER_NO_IMAGE_RESPONSE,
  JELLY_SERVER_RESPONSE,
  JELLY_SERVER_UNNAMED_RESPONSE,
  JELLY_LIBRARIES_RESPONSE,
  JELLY_ARTIST_PRIMARY,
  JELLY_ARTIST_BACKDROP,
  JELLY_ARTISTS_RESPONSE,
  JELLY_ALBUM_MAIN,
  JELLY_ALBUMS_RESPONSE,
  JELLY_PLAYLIST_MAIN,
  JELLY_PLAYLISTS_RESPONSE,
  JELLY_TRACK_FLAC,
  JELLY_TRACK_WMA,
  JELLY_TRACK_MINIMAL,
  JELLY_TRACK_ALBUM_ART,
  JELLY_TRACK_BACKDROP,
  JELLY_TRACK_PARENT_BACKDROP,
  JELLY_SEARCH_RESPONSE,
} from './__fixtures__/jellyfinApi';

// ======================================================================
// SHARED ARGUMENTS AND EXPECTED URL SHAPES
// ======================================================================

const serverBaseUrl = 'https://jellyfin.example.com';
const accessToken = 'test-access-token';
const libraryId = 'library-1';
const userId = 'user-1';

// Expected URL shapes, written out once so individual assertions stay readable.
// Note that thumb URLs deliberately do NOT include the access token.
const thumbUrl = (entryId: string, imageKey: string, size: number, tag: string) =>
  `${serverBaseUrl}/Items/${entryId}/Images/${imageKey}?fillHeight=${size}&fillWidth=${size}&quality=96&tag=${tag}`;

const directSrc = (trackId: string) => `${serverBaseUrl}/Audio/${trackId}/stream?static=true&api_key=${accessToken}`;

const transcodeSrc = (trackId: string) =>
  `${serverBaseUrl}/Audio/${trackId}/universal?api_key=${accessToken}&audioCodec=aac,mp3`;

// ======================================================================
// AUDIO CODEC SUPPORT MOCKING
// ======================================================================

// Track src selection calls requiresTranscoding(), which probes canPlayType on
// an audio element created via document.createElement('audio') — a native jsdom
// element, not our MockHTMLAudioElement. Spy on its prototype to control it.
const nativeAudioProto = Object.getPrototypeOf(document.createElement('audio')) as HTMLAudioElement;

const mockCanPlayType = (result: '' | 'maybe' | 'probably') => {
  vi.spyOn(nativeAudioProto, 'canPlayType').mockReturnValue(result);
};

// requiresTranscoding caches canPlayType results per codec at module level, so
// the cache must be cleared between tests to keep each test deterministic.
afterEach(() => {
  vi.restoreAllMocks();
  _clearCache();
});

// ======================================================================
// USER
// ======================================================================

describe('Testing "transposeUserData" function', () => {
  test('Transposes user info including the profile image URL', () => {
    const user = transposeUserData(JELLY_USER_RESPONSE, serverBaseUrl, accessToken, userId);
    expect(user).toEqual({
      userId: 'user-1',
      email: null,
      thumbSm: `${serverBaseUrl}/Users/${userId}/Images/Primary?tag=usertag123`,
      displayName: 'demo-user',
      serverBaseUrl,
    });
  });

  test('Returns a null thumb when the user has no primary image', () => {
    const user = transposeUserData(JELLY_USER_NO_IMAGE_RESPONSE, serverBaseUrl, accessToken, 'user-2');
    expect(user.thumbSm).toBeNull();
    expect(user.userId).toBe('user-2');
  });
});

// ======================================================================
// SERVERS
// ======================================================================

describe('Testing "transposeServerData" function', () => {
  test('Transposes system info into a single-entry server array', () => {
    const servers = transposeServerData(JELLY_SERVER_RESPONSE, accessToken);
    expect(servers).toEqual([
      {
        serverId: 'server-1',
        name: 'Home Media',
        accessToken,
        connections: undefined,
      },
    ]);
  });

  test('Falls back to a default name when ServerName is missing', () => {
    const servers = transposeServerData(JELLY_SERVER_UNNAMED_RESPONSE, accessToken);
    expect(servers[0].name).toBe('Unknown Jellyfin Server');
  });
});

// ======================================================================
// LIBRARIES
// ======================================================================

describe('Testing "transposeLibraryArray" function', () => {
  test('Keeps only libraries with the music collection type', () => {
    const libraries = transposeLibraryArray(JELLY_LIBRARIES_RESPONSE);
    expect(libraries).toEqual([{ libraryId: 'library-1', title: 'Music' }]);
  });

  test('Returns undefined for missing input (no empty-array fallback)', () => {
    // Unlike the other array transpose functions, this one has no `|| []` fallback.
    expect(transposeLibraryArray(undefined)).toBeUndefined();
    expect(transposeLibraryArray({ data: {} })).toBeUndefined();
  });
});

// ======================================================================
// ARTISTS
// ======================================================================

describe('Testing "transposeArtistArray" function', () => {
  test('Transposes a fully-populated artist with all fields mapped', () => {
    const artists = transposeArtistArray(JELLY_ARTISTS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(artists).toHaveLength(2);
    expect(artists[0]).toEqual({
      kind: 'artist',
      libraryId,
      artistId: 'artist-1',
      title: 'The Midnight Owls',
      genre: 'Indie Rock',
      country: null,
      addedAt: null,
      lastPlayed: null,
      userRating: null,
      isFavourite: true,
      link: '/libraries/library-1/artists/artist-1',
      thumbSm: thumbUrl('artist-1', 'Primary', 360, 'artistprimary1'),
      thumbMd: thumbUrl('artist-1', 'Primary', 680, 'artistprimary1'),
    });
  });

  test('Falls back to the backdrop image and defaults when fields are missing', () => {
    const artists = transposeArtistArray(JELLY_ARTISTS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(artists[1].thumbSm).toBe(thumbUrl('artist-2', 'Backdrop', 360, 'artistbackdrop2'));
    expect(artists[1].genre).toBeUndefined();
    expect(artists[1].isFavourite).toBe(false);
  });

  test('Returns an empty array for missing input', () => {
    expect(transposeArtistArray(undefined, libraryId, serverBaseUrl, accessToken)).toEqual([]);
    expect(transposeArtistArray({ data: {} }, libraryId, serverBaseUrl, accessToken)).toEqual([]);
  });
});

describe('Testing "transposeAlbumArtistArray" function', () => {
  test('Builds links under the album-artists path', () => {
    const artists = transposeAlbumArtistArray(JELLY_ARTISTS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(artists[0].link).toBe('/libraries/library-1/album-artists/artist-1');
    expect(artists[1].link).toBe('/libraries/library-1/album-artists/artist-2');
  });

  test('Returns an empty array for missing input', () => {
    expect(transposeAlbumArtistArray(undefined, libraryId, serverBaseUrl, accessToken)).toEqual([]);
  });
});

describe('Testing "transposeArtistDetails" function', () => {
  test('Transposes a single artist response', () => {
    const artist = transposeArtistDetails({ data: JELLY_ARTIST_PRIMARY }, libraryId, serverBaseUrl, accessToken);
    expect(artist.artistId).toBe('artist-1');
    expect(artist.title).toBe('The Midnight Owls');
    expect(artist.link).toBe('/libraries/library-1/artists/artist-1');
  });

  test('Falls back to the backdrop image when the artist has no primary image', () => {
    const artist = transposeArtistDetails({ data: JELLY_ARTIST_BACKDROP }, libraryId, serverBaseUrl, accessToken);
    expect(artist.artistId).toBe('artist-2');
    expect(artist.thumbSm).toBe(thumbUrl('artist-2', 'Backdrop', 360, 'artistbackdrop2'));
  });
});

// ======================================================================
// ALBUMS
// ======================================================================

describe('Testing "transposeAlbumArray" function', () => {
  test('Transposes a fully-populated album with all fields mapped', () => {
    const albums = transposeAlbumArray(JELLY_ALBUMS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(albums).toHaveLength(3);
    expect(albums[0]).toEqual({
      kind: 'album',
      libraryId,
      albumId: 'album-1',
      title: 'Nocturnal Songs',
      artist: 'The Midnight Owls',
      // 'artist-1' matches AlbumArtist by name and must win over the first entry.
      artistId: 'artist-1',
      artistLink: '/libraries/library-1/artists/artist-1',
      genre: 'Indie Rock',
      addedAt: null,
      lastPlayed: null,
      userRating: null,
      isFavourite: true,
      releaseDate: '2019-03-15T00:00:00.0000000Z',
      link: '/libraries/library-1/albums/album-1',
      thumbSm: thumbUrl('album-1', 'Primary', 360, 'albumprimary1'),
      thumbMd: thumbUrl('album-1', 'Primary', 680, 'albumprimary1'),
    });
  });

  test('Falls back to the first album artist when none matches the AlbumArtist name', () => {
    const albums = transposeAlbumArray(JELLY_ALBUMS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(albums[1].artist).toBe('Various Artists');
    expect(albums[1].artistId).toBe('artist-3');
    expect(albums[1].artistLink).toBe('/libraries/library-1/artists/artist-3');
  });

  test('Uses null artistId and null thumbs when artists and images are missing', () => {
    const albums = transposeAlbumArray(JELLY_ALBUMS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(albums[2].artistId).toBeNull();
    expect(albums[2].artistLink).toBe('/libraries/library-1/artists/null');
    expect(albums[2].isFavourite).toBe(false);
    expect(albums[2].thumbSm).toBeNull();
    expect(albums[2].thumbMd).toBeNull();
  });

  test('Returns an empty array for missing input', () => {
    expect(transposeAlbumArray(undefined, libraryId, serverBaseUrl, accessToken)).toEqual([]);
    expect(transposeAlbumArray({ data: {} }, libraryId, serverBaseUrl, accessToken)).toEqual([]);
  });
});

describe('Testing "transposeAlbumDetails" function', () => {
  test('Transposes a single album response', () => {
    const album = transposeAlbumDetails({ data: JELLY_ALBUM_MAIN }, libraryId, serverBaseUrl, accessToken);
    expect(album.albumId).toBe('album-1');
    expect(album.title).toBe('Nocturnal Songs');
    expect(album.link).toBe('/libraries/library-1/albums/album-1');
  });
});

// ======================================================================
// PLAYLISTS
// ======================================================================

describe('Testing "transposePlaylistArray" function', () => {
  test('Transposes a playlist with all fields mapped', () => {
    const playlists = transposePlaylistArray(JELLY_PLAYLISTS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(playlists).toEqual([
      {
        kind: 'playlist',
        libraryId,
        playlistId: 'playlist-1',
        title: 'Late Night Drive',
        addedAt: null,
        lastPlayed: null,
        userRating: null,
        isFavourite: true,
        link: '/libraries/library-1/playlists/playlist-1',
        totalTracks: 24,
        // RunTimeTicks (100ns units) converted to milliseconds.
        duration: 5400000,
        thumbSm: thumbUrl('playlist-1', 'Primary', 360, 'playlistprimary1'),
        thumbMd: thumbUrl('playlist-1', 'Primary', 680, 'playlistprimary1'),
      },
    ]);
  });

  test('Returns an empty array for missing input', () => {
    expect(transposePlaylistArray(undefined, libraryId, serverBaseUrl, accessToken)).toEqual([]);
  });
});

describe('Testing "transposePlaylistDetails" function', () => {
  test('Transposes a single playlist response', () => {
    const playlist = transposePlaylistDetails({ data: JELLY_PLAYLIST_MAIN }, libraryId, serverBaseUrl, accessToken);
    expect(playlist.playlistId).toBe('playlist-1');
    expect(playlist.totalTracks).toBe(24);
    expect(playlist.link).toBe('/libraries/library-1/playlists/playlist-1');
  });
});

// ======================================================================
// TAGS
// ======================================================================

describe('Testing "transposeTagArray" function', () => {
  test('Transposes genre strings, encoding ids and replacing slashes in titles', () => {
    const genres = transposeTagArray(['Rock', 'Drum/Bass'], libraryId, 'artist', 'Genre');
    expect(genres).toEqual([
      {
        kind: 'genre',
        libraryId,
        genreId: 'Rock',
        title: 'Rock',
        link: '/libraries/library-1/artist-genres/Rock',
      },
      {
        kind: 'genre',
        libraryId,
        genreId: 'Drum__SLSH__Bass',
        title: 'Drum & Bass',
        link: '/libraries/library-1/artist-genres/Drum__SLSH__Bass',
      },
    ]);
  });

  test('Transposes tag strings under the given primary key', () => {
    const tags = transposeTagArray(['Live'], libraryId, 'album', 'Tag');
    expect(tags).toEqual([
      {
        kind: 'tag',
        libraryId,
        tagId: 'Live',
        title: 'Live',
        link: '/libraries/library-1/album-tags/Live',
      },
    ]);
  });

  test('Returns an empty array for missing input', () => {
    expect(transposeTagArray(undefined, libraryId, 'artist', 'Genre')).toEqual([]);
  });
});

// ======================================================================
// TRACKS
// ======================================================================

describe('Testing "transposeTrackArray" function', () => {
  // Default to a browser that can play everything; individual tests override this.
  beforeEach(() => {
    mockCanPlayType('probably');
  });

  const transposeTracks = (items: object[]) =>
    transposeTrackArray({ data: { Items: items } }, libraryId, serverBaseUrl, accessToken);

  const trackWithCodec = (codec: string) => ({
    ...JELLY_TRACK_FLAC,
    MediaStreams: [{ Codec: codec, Type: 'Audio', Index: 0, BitRate: 1000000 }],
  });

  test('Transposes a fully-populated track with all fields mapped', () => {
    const tracks = transposeTracks([JELLY_TRACK_FLAC]);
    expect(tracks).toEqual([
      {
        kind: 'track',
        libraryId,
        trackId: 'track-1',
        trackKey: null,
        playlistItemID: 'playlistitem-77',
        title: 'City Lights',
        artist: 'The Midnight Owls',
        // 'artist-1' matches AlbumArtist by name and must win over the first entry.
        artistLink: '/libraries/library-1/artists/artist-1',
        album: 'Nocturnal Songs',
        albumId: 'album-1',
        albumLink: '/libraries/library-1/albums/album-1',
        trackNumber: 3,
        discNumber: 1,
        // Codec and bitrate come from the 'Audio' stream, not the 'EmbeddedImage' one.
        codec: 'flac',
        bitrate: 1411,
        // RunTimeTicks (100ns units) converted to milliseconds.
        duration: 216000,
        userRating: null,
        isFavourite: true,
        releaseDate: '2019-03-15T00:00:00.0000000Z',
        // The track's own Primary image wins over the AlbumPrimaryImageTag fallback.
        thumbSm: thumbUrl('track-1', 'Primary', 360, 'trackprimary1'),
        thumbMd: thumbUrl('track-1', 'Primary', 680, 'trackprimary1'),
        src: directSrc('track-1'),
      },
    ]);
  });

  test('Rounds bitrate to the nearest kbps', () => {
    // 192500 bps rounds up to 193 kbps.
    const tracks = transposeTracks([JELLY_TRACK_WMA]);
    expect(tracks[0].bitrate).toBe(193);
  });

  test('Falls back to the first album artist when none matches the AlbumArtist name', () => {
    const tracks = transposeTracks([{ ...JELLY_TRACK_FLAC, AlbumArtist: 'Someone Else' }]);
    expect(tracks[0].artist).toBe('Someone Else');
    expect(tracks[0].artistLink).toBe('/libraries/library-1/artists/artist-2');
  });

  test('Uses the direct stream endpoint for natively playable codecs', () => {
    mockCanPlayType('probably');
    const tracks = transposeTracks([JELLY_TRACK_FLAC]);
    expect(tracks[0].src).toBe(directSrc('track-1'));
  });

  test('Uses the universal transcoding endpoint when the browser cannot play the codec', () => {
    mockCanPlayType('');
    const tracks = transposeTracks([JELLY_TRACK_FLAC]);
    expect(tracks[0].src).toBe(transcodeSrc('track-1'));
  });

  test('Uses the universal transcoding endpoint for codecs with no known MIME type', () => {
    // 'ape' is not in the codec MIME map, so it always requires transcoding —
    // even though canPlayType is mocked to report support for everything.
    mockCanPlayType('probably');
    const tracks = transposeTracks([trackWithCodec('ape')]);
    expect(tracks[0].codec).toBe('ape');
    expect(tracks[0].src).toBe(transcodeSrc('track-1'));
  });

  test('Maps raw PCM and WMA codec identifiers to display names', () => {
    const tracks = transposeTracks([
      trackWithCodec('pcm_s16le'),
      trackWithCodec('pcm_s24le'),
      trackWithCodec('pcm_s16be'),
      trackWithCodec('wmav2'),
      trackWithCodec('mp3'),
    ]);
    expect(tracks.map((track: { codec: string }) => track.codec)).toEqual(['wav', 'wav', 'aiff', 'wma', 'mp3']);
  });

  test('Falls back to the album primary image when the track has no images', () => {
    const tracks = transposeTracks([JELLY_TRACK_ALBUM_ART]);
    expect(tracks[0].thumbSm).toBe(thumbUrl('album-1', 'Primary', 360, 'albumprimary1'));
    expect(tracks[0].thumbMd).toBe(thumbUrl('album-1', 'Primary', 680, 'albumprimary1'));
  });

  test('Falls back to the track backdrop when no primary images exist', () => {
    const tracks = transposeTracks([JELLY_TRACK_BACKDROP]);
    expect(tracks[0].thumbSm).toBe(thumbUrl('track-5', 'Backdrop', 360, 'trackbackdrop5'));
  });

  test('Falls back to the album backdrop as the last resort', () => {
    const tracks = transposeTracks([JELLY_TRACK_PARENT_BACKDROP]);
    expect(tracks[0].thumbSm).toBe(thumbUrl('album-1', 'Backdrop', 360, 'parentbackdrop1'));
  });

  test('Does not include the access token in thumb URLs', () => {
    const tracks = transposeTracks([JELLY_TRACK_FLAC]);
    expect(tracks[0].thumbSm).not.toContain(accessToken);
    expect(tracks[0].src).toContain(accessToken);
  });

  test('Transposes a minimal track with defaults for all missing fields', () => {
    const tracks = transposeTracks([JELLY_TRACK_MINIMAL]);
    expect(tracks).toEqual([
      {
        kind: 'track',
        libraryId,
        trackId: 'track-3',
        trackKey: null,
        playlistItemID: undefined,
        title: 'Untitled',
        artist: undefined,
        // Current behaviour: missing ids are interpolated into link strings.
        artistLink: '/libraries/library-1/artists/null',
        album: undefined,
        albumId: undefined,
        albumLink: '/libraries/library-1/albums/undefined',
        trackNumber: undefined,
        discNumber: undefined,
        codec: undefined,
        bitrate: null,
        duration: NaN,
        userRating: null,
        isFavourite: false,
        releaseDate: null,
        thumbSm: null,
        thumbMd: null,
        // A missing codec always requires transcoding.
        src: transcodeSrc('track-3'),
      },
    ]);
  });

  test('Returns an empty array for missing input', () => {
    expect(transposeTrackArray(undefined, libraryId, serverBaseUrl, accessToken)).toEqual([]);
    expect(transposeTrackArray({ data: {} }, libraryId, serverBaseUrl, accessToken)).toEqual([]);
    expect(transposeTracks([])).toEqual([]);
  });
});

// ======================================================================
// SEARCH RESULTS
// ======================================================================

describe('Testing "transposeSearchResultsArray" function', () => {
  test('Sorts results by type then title, dropping unsupported types', () => {
    const results = transposeSearchResultsArray(JELLY_SEARCH_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(results.map((result: { title: string }) => result.title)).toEqual([
      'Alpha Court',
      'Beta Waves',
      'Basement Sessions',
      'Morning Mix',
      'Alpine Air',
      'Zebra Crossing',
    ]);
    expect(results.map((result: { type: string }) => result.type)).toEqual([
      'artist',
      'artist',
      'album',
      'playlist',
      'track',
      'track',
    ]);
  });

  test('Maps each result type to its id, icon, link, and thumb', () => {
    const results = transposeSearchResultsArray(JELLY_SEARCH_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(results[1]).toEqual({
      artistId: 'artist-21',
      type: 'artist',
      icon: 'PeopleIcon',
      title: 'Beta Waves',
      link: '/libraries/library-1/artists/artist-21',
      thumbSm: thumbUrl('artist-21', 'Primary', 360, 'searchartist21'),
    });
    expect(results[2]).toEqual({
      albumId: 'album-24',
      type: 'album',
      icon: 'PlayCircleIcon',
      title: 'Basement Sessions',
      link: '/libraries/library-1/albums/album-24',
      thumbSm: null,
    });
    expect(results[3]).toEqual({
      playlistId: 'playlist-22',
      type: 'playlist',
      icon: 'PlaylistIcon',
      title: 'Morning Mix',
      link: '/libraries/library-1/playlists/playlist-22',
      thumbSm: null,
    });
  });

  test('Links track results to the parent album, falling back to AlbumId', () => {
    const results = transposeSearchResultsArray(JELLY_SEARCH_RESPONSE, libraryId, serverBaseUrl, accessToken);
    // 'Alpine Air' has both ParentId and AlbumId — ParentId wins.
    expect(results[4]).toEqual({
      trackId: 'track-23',
      type: 'track',
      icon: 'MusicNoteSingleIcon',
      title: 'Alpine Air',
      link: '/libraries/library-1/albums/album-23',
      thumbSm: null,
    });
    // 'Zebra Crossing' has only AlbumId.
    expect(results[5].link).toBe('/libraries/library-1/albums/album-20');
  });

  test('Returns an empty array for missing input', () => {
    expect(transposeSearchResultsArray(undefined, libraryId, serverBaseUrl, accessToken)).toEqual([]);
    expect(transposeSearchResultsArray({ data: {} }, libraryId, serverBaseUrl, accessToken)).toEqual([]);
  });
});
