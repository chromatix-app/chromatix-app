// Generated using Claude Code

import {
  transposeAllUsersArray,
  transposeUserData,
  transposeServerArray,
  transposeLibraryArray,
  transposeArtistArray,
  transposeArtistDetails,
  transposeArtistRelatedArray,
  transposeArtistAppearanceAlbumIdsArray,
  transposeAlbumArray,
  transposeAlbumDetails,
  transposeFolderArray,
  transposePlaylistArray,
  transposePlaylistDetails,
  transposeCollectionArray,
  transposeCollectionItemArray,
  transposeTagArray,
  transposeTagItemArray,
  transposeTrackArray,
  transposeSearchResultsArray,
} from './plexTranspose';
import {
  PLEX_ALBUMS_RESPONSE,
  PLEX_ALL_USERS_RESPONSE,
  PLEX_ARTIST_RELATED_RESPONSE,
  PLEX_ARTISTS_RESPONSE,
  PLEX_COLLECTIONS_RESPONSE,
  PLEX_EMPTY_RESPONSE,
  PLEX_FOLDER_TRACKS_RESPONSE,
  PLEX_FOLDERS_RESPONSE,
  PLEX_LIBRARIES_RESPONSE,
  PLEX_PLAYLISTS_RESPONSE,
  PLEX_RESOURCES_RESPONSE,
  PLEX_SEARCH_RESPONSE,
  PLEX_TAGS_RESPONSE,
  PLEX_TRACKS_RESPONSE,
  PLEX_USER_RESPONSE,
} from './__fixtures__/plexResponses';

// ======================================================================
// SHARED TEST VALUES
// ======================================================================

const libraryId = '20';
const serverBaseUrl = 'https://plex.example.com:32400';
const accessToken = 'test-plex-token';
const timeStamp = 1000;

// Expected photo transcode URLs, as built by getThumb in plexTranspose.js
const thumb200Sm = `${serverBaseUrl}/photo/:/transcode?width=360&height=360&url=%2Flibrary%2Fmetadata%2F200%2Fthumb%2F1712345678&minSize=1&X-Plex-Token=${accessToken}`;
const thumb200Md = `${serverBaseUrl}/photo/:/transcode?width=680&height=680&url=%2Flibrary%2Fmetadata%2F200%2Fthumb%2F1712345678&minSize=1&X-Plex-Token=${accessToken}`;
const thumb100Sm = `${serverBaseUrl}/photo/:/transcode?width=360&height=360&url=%2Flibrary%2Fmetadata%2F100%2Fthumb%2F1711111111&minSize=1&X-Plex-Token=${accessToken}`;
const thumb100Md = `${serverBaseUrl}/photo/:/transcode?width=680&height=680&url=%2Flibrary%2Fmetadata%2F100%2Fthumb%2F1711111111&minSize=1&X-Plex-Token=${accessToken}`;

// ======================================================================
// ALL USERS
// ======================================================================

describe('Testing "transposeAllUsersArray" function', () => {
  test('Transposes all user fields', () => {
    const users = transposeAllUsersArray(PLEX_ALL_USERS_RESPONSE);
    expect(users).toHaveLength(2);
    expect(users[0]).toStrictEqual({
      admin: true,
      displayName: 'Adam',
      email: 'adam@example.com',
      guest: false,
      pinProtected: true,
      restrictionProfile: undefined,
      thumbSm: 'https://plex.tv/users/uuid-adam/avatar?c=1712345678',
      userId: 111,
      uuid: 'uuid-adam',
    });
  });

  test('Falls back to the username when the title is empty', () => {
    const users = transposeAllUsersArray(PLEX_ALL_USERS_RESPONSE);
    expect(users[1].displayName).toBe('kiddo');
    expect(users[1].restrictionProfile).toBe('little_kid');
  });

  test('Returns an empty array for missing input', () => {
    expect(transposeAllUsersArray(undefined)).toEqual([]);
    expect(transposeAllUsersArray({ data: {} })).toEqual([]);
  });
});

// ======================================================================
// USER
// ======================================================================

describe('Testing "transposeUserData" function', () => {
  test('Transposes user fields', () => {
    expect(transposeUserData(PLEX_USER_RESPONSE)).toStrictEqual({
      displayName: 'Adam',
      email: 'adam@example.com',
      thumbSm: 'https://plex.tv/users/uuid-adam/avatar?c=1712345678',
      userId: 111,
    });
  });

  test('Falls back to the username when the title is missing', () => {
    const user = transposeUserData({ data: { id: 5, username: 'nobody' } });
    expect(user.displayName).toBe('nobody');
  });
});

// ======================================================================
// SERVERS
// ======================================================================

describe('Testing "transposeServerArray" function', () => {
  test('Returns only resources that provide a server', () => {
    const servers = transposeServerArray(PLEX_RESOURCES_RESPONSE);
    expect(servers).toHaveLength(2);
    expect(servers[0]).toStrictEqual({
      serverId: 'abc123',
      name: 'Home Server',
      accessToken: 'server-token-1',
      connections: [
        {
          protocol: 'https',
          address: '192.168.1.10',
          port: 32400,
          uri: 'https://192-168-1-10.abc123.plex.direct:32400',
          local: true,
        },
      ],
    });
  });

  test('Falls back to a default name when the server has none', () => {
    const servers = transposeServerArray(PLEX_RESOURCES_RESPONSE);
    expect(servers[1].name).toBe('Unknown Plex Server');
    expect(servers[1].serverId).toBe('def456');
  });

  test('Returns an empty array for missing input', () => {
    expect(transposeServerArray(undefined)).toEqual([]);
    expect(transposeServerArray({ data: undefined })).toEqual([]);
  });
});

// ======================================================================
// LIBRARIES
// ======================================================================

describe('Testing "transposeLibraryArray" function', () => {
  test('Returns only music (artist) libraries', () => {
    expect(transposeLibraryArray(PLEX_LIBRARIES_RESPONSE)).toStrictEqual([
      { libraryId: '20', title: 'Music' },
      { libraryId: '21', title: 'Classical' },
    ]);
  });

  test('Returns undefined for missing input', () => {
    // Note: unlike the other transpose functions, there is no `|| []` fallback here
    expect(transposeLibraryArray(undefined)).toBeUndefined();
    expect(transposeLibraryArray(PLEX_EMPTY_RESPONSE)).toBeUndefined();
  });
});

// ======================================================================
// ARTISTS
// ======================================================================

describe('Testing "transposeArtistArray" function', () => {
  test('Transposes an artist with full field mapping', () => {
    const artists = transposeArtistArray(PLEX_ARTISTS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(artists).toHaveLength(2);
    expect(artists[0]).toStrictEqual({
      kind: 'artist',
      libraryId: '20',
      artistId: '100',
      title: 'The Static Charms',
      genre: 'Electronic',
      country: 'United Kingdom',
      addedAt: 1680000000,
      lastPlayed: 1711000000,
      userRating: 8,
      isFavourite: false,
      link: '/libraries/20/artists/100',
      thumbSm: thumb100Sm,
      thumbMd: thumb100Md,
    });
  });

  test('Handles artists with missing optional fields', () => {
    const artists = transposeArtistArray(PLEX_ARTISTS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(artists[1].genre).toBeUndefined();
    expect(artists[1].country).toBeUndefined();
    expect(artists[1].thumbSm).toBeNull();
    expect(artists[1].thumbMd).toBeNull();
  });

  test('Returns an empty array for missing or empty input', () => {
    expect(transposeArtistArray(undefined, libraryId, serverBaseUrl, accessToken)).toEqual([]);
    expect(transposeArtistArray(PLEX_EMPTY_RESPONSE, libraryId, serverBaseUrl, accessToken)).toEqual([]);
  });
});

describe('Testing "transposeArtistDetails" function', () => {
  test('Transposes the first metadata entry', () => {
    const artist = transposeArtistDetails(PLEX_ARTISTS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(artist.artistId).toBe('100');
    expect(artist).toEqual(transposeArtistArray(PLEX_ARTISTS_RESPONSE, libraryId, serverBaseUrl, accessToken)[0]);
  });
});

describe('Testing "transposeArtistRelatedArray" function', () => {
  test('Includes only album hubs with metadata and an artist-albums context', () => {
    const related = transposeArtistRelatedArray(PLEX_ARTIST_RELATED_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(related).toHaveLength(2);
    expect(related[0].title).toBe('Albums');
    expect(related[1].title).toBe('Live Albums, Singles & EPs');
    // Hub entries are transposed as albums
    expect(related[0].related).toEqual([
      transposeAlbumArray(PLEX_ALBUMS_RESPONSE, libraryId, serverBaseUrl, accessToken)[0],
    ]);
    expect(related[1].related[0].albumId).toBe('210');
    expect(related[1].related[0].link).toBe('/libraries/20/albums/210');
  });

  test('Returns an empty array for missing input', () => {
    expect(transposeArtistRelatedArray(undefined, libraryId, serverBaseUrl, accessToken)).toEqual([]);
  });
});

describe('Testing "transposeArtistAppearanceAlbumIdsArray" function', () => {
  test('Returns unique album IDs from the track list', () => {
    const albumIds = transposeArtistAppearanceAlbumIdsArray(
      PLEX_TRACKS_RESPONSE,
      libraryId,
      serverBaseUrl,
      accessToken
    );
    expect(albumIds).toEqual(['200', '201', '202']);
  });

  test('Returns an empty array for missing input', () => {
    expect(transposeArtistAppearanceAlbumIdsArray(undefined, libraryId, serverBaseUrl, accessToken)).toEqual([]);
  });
});

// ======================================================================
// ALBUMS
// ======================================================================

describe('Testing "transposeAlbumArray" function', () => {
  test('Transposes an album with full field mapping', () => {
    const albums = transposeAlbumArray(PLEX_ALBUMS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(albums).toHaveLength(2);
    expect(albums[0]).toStrictEqual({
      kind: 'album',
      libraryId: '20',
      albumId: '200',
      title: 'Electric Nights',
      artist: 'The Static Charms',
      artistId: '100',
      artistLink: '/libraries/20/artists/100',
      genre: 'Electronic',
      addedAt: 1700000001,
      lastPlayed: 1712000001,
      userRating: 9,
      isFavourite: false,
      releaseDate: '2020-05-15',
      link: '/libraries/20/albums/200',
      thumbSm: thumb200Sm,
      thumbMd: thumb200Md,
    });
  });

  test('Handles albums with missing optional fields', () => {
    const albums = transposeAlbumArray(PLEX_ALBUMS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(albums[1].genre).toBeUndefined();
    expect(albums[1].releaseDate).toBeUndefined();
    expect(albums[1].userRating).toBeUndefined();
    expect(albums[1].thumbSm).toBeNull();
    expect(albums[1].thumbMd).toBeNull();
  });

  test('Returns an empty array for missing or empty input', () => {
    expect(transposeAlbumArray(undefined, libraryId, serverBaseUrl, accessToken)).toEqual([]);
    expect(transposeAlbumArray(PLEX_EMPTY_RESPONSE, libraryId, serverBaseUrl, accessToken)).toEqual([]);
  });
});

describe('Testing "transposeAlbumDetails" function', () => {
  test('Transposes the first metadata entry', () => {
    const album = transposeAlbumDetails(PLEX_ALBUMS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(album.albumId).toBe('200');
    expect(album).toEqual(transposeAlbumArray(PLEX_ALBUMS_RESPONSE, libraryId, serverBaseUrl, accessToken)[0]);
  });
});

// ======================================================================
// FOLDERS
// ======================================================================

describe('Testing "transposeFolderArray" function', () => {
  test('Transposes folder rows and derives folderId from the parent key', () => {
    const items = transposeFolderArray(PLEX_FOLDERS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(items[1]).toStrictEqual({
      kind: 'aaafolder',
      libraryId: '20',
      folderId: '42',
      title: 'Zeta Sessions',
      link: '/libraries/20/folders/42',
      sortOrder: 1,
    });
  });

  test('Excludes non-track metadata rows and keeps folder rows in API order', () => {
    const items = transposeFolderArray(PLEX_FOLDERS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    // The 'Stray Album Row' entry (ratingKey present, type !== 'track') is dropped.
    // The sort comparator checks for kind 'folder' but folders are kind 'aaafolder',
    // so folder rows keep their API order and are not moved above tracks here.
    expect(items).toHaveLength(3);
    expect(items.map((item: { title: string }) => item.title)).toEqual([
      'Rehearsal Take',
      'Zeta Sessions',
      'Alpha Takes',
    ]);
    expect(items[0].kind).toBe('track');
    expect(items[0].trackSortOrder).toBe(0);
  });

  test('Sorts tracks by album, then disc number, then track number, and assigns sort orders', () => {
    const items = transposeFolderArray(PLEX_FOLDER_TRACKS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(items.map((item: { title: string }) => item.title)).toEqual([
      'First Disc Opener',
      'First Disc Closer',
      'Second Disc Opener',
      'Late Album Opener',
    ]);
    expect(items.map((item: { sortOrder: number }) => item.sortOrder)).toEqual([0, 1, 2, 3]);
    expect(items.map((item: { trackSortOrder: number }) => item.trackSortOrder)).toEqual([0, 1, 2, 3]);
  });

  test('Returns an empty array for missing input', () => {
    expect(transposeFolderArray(undefined, libraryId, serverBaseUrl, accessToken)).toEqual([]);
  });
});

// ======================================================================
// PLAYLISTS
// ======================================================================

describe('Testing "transposePlaylistArray" function', () => {
  test('Transposes a playlist with full field mapping, preferring the thumb over the composite', () => {
    const playlists = transposePlaylistArray(
      PLEX_PLAYLISTS_RESPONSE,
      libraryId,
      serverBaseUrl,
      accessToken,
      timeStamp,
      {}
    );
    expect(playlists).toHaveLength(4);
    expect(playlists[0]).toStrictEqual({
      kind: 'playlist',
      libraryId: '20',
      playlistId: '300',
      title: 'Morning Coffee',
      addedAt: 1701000000,
      lastPlayed: 1712500000,
      userRating: 10,
      isFavourite: false,
      link: '/libraries/20/playlists/300',
      totalTracks: 25,
      duration: 5400000,
      thumbSm: `${serverBaseUrl}/photo/:/transcode?width=360&height=360&url=%2Flibrary%2Fmetadata%2F300%2Fthumb%2F1712000000&minSize=1&X-Plex-Token=${accessToken}`,
      thumbMd: `${serverBaseUrl}/photo/:/transcode?width=680&height=680&url=%2Flibrary%2Fmetadata%2F300%2Fthumb%2F1712000000&minSize=1&X-Plex-Token=${accessToken}`,
    });
  });

  test('Replaces the composite URL timestamp with the given timestamp plus playlist edits', () => {
    const playlists = transposePlaylistArray(
      PLEX_PLAYLISTS_RESPONSE,
      libraryId,
      serverBaseUrl,
      accessToken,
      timeStamp,
      {
        301: 7,
      }
    );
    // Playlist 301 has an edit count of 7, so its timestamp becomes 1000 + 7
    expect(playlists[1].thumbSm).toBe(
      `${serverBaseUrl}/photo/:/transcode?width=360&height=360&url=%2Flibrary%2Fplaylists%2F301%2Fcomposite%2F1007&minSize=1&X-Plex-Token=${accessToken}`
    );
    // Playlist 302 has no edits and trailing slashes on its composite URL
    expect(playlists[2].thumbSm).toContain('url=%2Flibrary%2Fplaylists%2F302%2Fcomposite%2F1000&');
  });

  test('Returns null thumbs when there is no thumb or composite', () => {
    const playlists = transposePlaylistArray(
      PLEX_PLAYLISTS_RESPONSE,
      libraryId,
      serverBaseUrl,
      accessToken,
      timeStamp,
      {}
    );
    expect(playlists[3].thumbSm).toBeNull();
    expect(playlists[3].thumbMd).toBeNull();
  });

  test('Returns an empty array for missing or empty input', () => {
    expect(transposePlaylistArray(undefined, libraryId, serverBaseUrl, accessToken, timeStamp, {})).toEqual([]);
    expect(transposePlaylistArray(PLEX_EMPTY_RESPONSE, libraryId, serverBaseUrl, accessToken, timeStamp, {})).toEqual(
      []
    );
  });
});

describe('Testing "transposePlaylistDetails" function', () => {
  test('Transposes the first metadata entry', () => {
    const playlist = transposePlaylistDetails(
      PLEX_PLAYLISTS_RESPONSE,
      libraryId,
      serverBaseUrl,
      accessToken,
      timeStamp
    );
    expect(playlist.playlistId).toBe('300');
    expect(playlist.totalTracks).toBe(25);
    expect(playlist).toEqual(
      transposePlaylistArray(PLEX_PLAYLISTS_RESPONSE, libraryId, serverBaseUrl, accessToken, timeStamp, {})[0]
    );
  });
});

// ======================================================================
// COLLECTIONS
// ======================================================================

describe('Testing "transposeCollectionArray" function', () => {
  test('Splits collections into artist and album collections', () => {
    const collections = transposeCollectionArray(PLEX_COLLECTIONS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(collections.allArtistCollections).toHaveLength(1);
    expect(collections.allAlbumCollections).toHaveLength(1);
    expect(collections.allArtistCollections[0]).toStrictEqual({
      kind: 'collection',
      libraryId: '20',
      collectionId: '400',
      title: 'Favourite Artists',
      addedAt: 1699000000,
      userRating: 7,
      type: 'artist',
      link: '/libraries/20/artist-collections/400',
      thumbSm: `${serverBaseUrl}/photo/:/transcode?width=360&height=360&url=%2Flibrary%2Fcollections%2F400%2Fthumb%2F1712345000&minSize=1&X-Plex-Token=${accessToken}`,
      thumbMd: `${serverBaseUrl}/photo/:/transcode?width=680&height=680&url=%2Flibrary%2Fcollections%2F400%2Fthumb%2F1712345000&minSize=1&X-Plex-Token=${accessToken}`,
    });
  });

  test('Falls back to the composite image when a collection has no thumb', () => {
    const collections = transposeCollectionArray(PLEX_COLLECTIONS_RESPONSE, libraryId, serverBaseUrl, accessToken);
    expect(collections.allAlbumCollections[0].type).toBe('album');
    expect(collections.allAlbumCollections[0].link).toBe('/libraries/20/album-collections/401');
    expect(collections.allAlbumCollections[0].thumbSm).toContain(
      'url=%2Flibrary%2Fcollections%2F401%2Fcomposite%2F1712345600&'
    );
  });

  test('Returns empty arrays for missing input', () => {
    expect(transposeCollectionArray(undefined, libraryId, serverBaseUrl, accessToken)).toEqual({
      allArtistCollections: [],
      allAlbumCollections: [],
    });
  });
});

describe('Testing "transposeCollectionItemArray" function', () => {
  test('Transposes collection items using the type key', () => {
    expect(transposeCollectionItemArray(PLEX_ALBUMS_RESPONSE, libraryId, serverBaseUrl, accessToken, 'Album')).toEqual(
      transposeAlbumArray(PLEX_ALBUMS_RESPONSE, libraryId, serverBaseUrl, accessToken)
    );
    expect(
      transposeCollectionItemArray(PLEX_ARTISTS_RESPONSE, libraryId, serverBaseUrl, accessToken, 'Artist')
    ).toEqual(transposeArtistArray(PLEX_ARTISTS_RESPONSE, libraryId, serverBaseUrl, accessToken));
  });
});

// ======================================================================
// TAGS
// ======================================================================

describe('Testing "transposeTagArray" function', () => {
  test('Transposes genre tags and replaces slashes in titles', () => {
    expect(transposeTagArray(PLEX_TAGS_RESPONSE, libraryId, 'AlbumGenres')).toStrictEqual([
      { kind: 'genre', libraryId: '20', genreId: '9001', title: 'Rock & Pop', link: '/libraries/20/album-genres/9001' },
      { kind: 'genre', libraryId: '20', genreId: '9002', title: 'Jazz', link: '/libraries/20/album-genres/9002' },
    ]);
  });

  test('Builds mood and style links from the type key', () => {
    const moods = transposeTagArray(PLEX_TAGS_RESPONSE, libraryId, 'ArtistMoods');
    expect(moods[0].kind).toBe('mood');
    expect(moods[0].moodId).toBe('9001');
    expect(moods[0].link).toBe('/libraries/20/artist-moods/9001');

    const styles = transposeTagArray(PLEX_TAGS_RESPONSE, libraryId, 'ArtistStyles');
    expect(styles[0].kind).toBe('style');
    expect(styles[0].styleId).toBe('9001');
    expect(styles[0].link).toBe('/libraries/20/artist-styles/9001');
  });

  test('Returns an empty array for missing input', () => {
    expect(transposeTagArray(undefined, libraryId, 'AlbumGenres')).toEqual([]);
  });
});

describe('Testing "transposeTagItemArray" function', () => {
  test('Transposes tag items using the type key', () => {
    expect(
      transposeTagItemArray(PLEX_ALBUMS_RESPONSE, libraryId, serverBaseUrl, accessToken, 'AlbumGenreItems')
    ).toEqual(transposeAlbumArray(PLEX_ALBUMS_RESPONSE, libraryId, serverBaseUrl, accessToken));
    expect(
      transposeTagItemArray(PLEX_ARTISTS_RESPONSE, libraryId, serverBaseUrl, accessToken, 'ArtistMoodItems')
    ).toEqual(transposeArtistArray(PLEX_ARTISTS_RESPONSE, libraryId, serverBaseUrl, accessToken));
  });
});

// ======================================================================
// TRACKS
// ======================================================================

describe('Testing "transposeTrackArray" function', () => {
  const tracks = transposeTrackArray(PLEX_TRACKS_RESPONSE, libraryId, serverBaseUrl, accessToken);

  test('Transposes a standard track with full field mapping', () => {
    expect(tracks).toHaveLength(4);
    expect(tracks[0]).toStrictEqual({
      kind: 'track',
      libraryId: '20',
      trackId: '5001',
      trackKey: '/library/metadata/5001',
      playlistItemID: undefined,
      title: 'Opening Theme',
      artist: 'The Static Charms',
      artistLink: '/libraries/20/artists/100',
      album: 'Electric Nights',
      albumId: '200',
      albumLink: '/libraries/20/albums/200',
      trackNumber: 1,
      discNumber: 1,
      codec: 'flac',
      bitrate: 1043,
      duration: 215000,
      userRating: 10,
      releaseDate: '2020-01-01',
      thumbSm: thumb200Sm,
      thumbMd: thumb200Md,
      src: `${serverBaseUrl}/library/parts/9001/1650000001/file.flac?X-Plex-Token=${accessToken}`,
    });
  });

  test('Builds the src URL from the server base URL, first media part key and access token', () => {
    expect(tracks[1].src).toBe(`${serverBaseUrl}/library/parts/9002/1650000002/file.wma?X-Plex-Token=${accessToken}`);
    expect(tracks[3].src).toBe(`${serverBaseUrl}/library/parts/9004/1650000004/file.aiff?X-Plex-Token=${accessToken}`);
  });

  test('Uses originalTitle as the artist with no artist link for appearance tracks', () => {
    // originalTitle differs from grandparentTitle — likely an appearance
    expect(tracks[1].artist).toBe('The Featured Act');
    expect(tracks[1].artistLink).toBeNull();
    // originalTitle matches grandparentTitle — treated as the album artist
    expect(tracks[2].artist).toBe('The Static Charms');
    expect(tracks[2].artistLink).toBe('/libraries/20/artists/100');
  });

  test('Maps codecs for display: wmav2 becomes wma and pcm uses the container', () => {
    expect(tracks.map((track: { codec: string }) => track.codec)).toEqual(['flac', 'wma', 'wav', 'aiff']);
  });

  test('Builds thumb URLs via the photo transcode endpoint and strips existing query params', () => {
    expect(tracks[0].thumbSm).toBe(thumb200Sm);
    expect(tracks[0].thumbMd).toBe(thumb200Md);
    // Track 3's raw thumb carries a stale query string, which is stripped before encoding
    expect(tracks[2].thumbSm).toBe(thumb200Sm);
    expect(tracks[2].thumbSm).not.toContain('stale-token');
  });

  test('Returns null thumbs when a track has no thumb', () => {
    expect(tracks[1].thumbSm).toBeNull();
    expect(tracks[1].thumbMd).toBeNull();
  });

  test('Derives releaseDate from parentYear', () => {
    expect(tracks[0].releaseDate).toBe('2020-01-01');
    expect(tracks[3].releaseDate).toBe('1974-01-01');
    expect(tracks[1].releaseDate).toBeNull();
  });

  test('Maps playlistItemID when present', () => {
    expect(tracks[3].playlistItemID).toBe(90004);
    expect(tracks[0].playlistItemID).toBeUndefined();
  });

  test('Returns an empty array for missing or empty input', () => {
    expect(transposeTrackArray(undefined, libraryId, serverBaseUrl, accessToken)).toEqual([]);
    expect(transposeTrackArray(PLEX_EMPTY_RESPONSE, libraryId, serverBaseUrl, accessToken)).toEqual([]);
  });
});

// ======================================================================
// SEARCH RESULTS
// ======================================================================

describe('Testing "transposeSearchResultsArray" function', () => {
  const results = transposeSearchResultsArray(PLEX_SEARCH_RESPONSE, libraryId, serverBaseUrl, accessToken);

  test('Sorts results by score, then type order, then title', () => {
    expect(results.map((result: { title: string }) => result.title)).toEqual([
      'Electric Nights', // highest score
      'Analog Archive', // artist, title tiebreak
      'The Static Charms', // artist, title tiebreak
      'Deep Focus', // playlist
      'Best of 2020', // album collection
      'Opening Theme', // track
    ]);
  });

  test('Maps result fields per type', () => {
    expect(results[0]).toStrictEqual({
      score: 0.95,
      albumId: '200',
      type: 'album',
      icon: 'PlayCircleIcon',
      title: 'Electric Nights',
      link: '/libraries/20/albums/200',
      thumbSm: thumb200Sm,
    });
    expect(results[2]).toStrictEqual({
      score: 0.9,
      artistId: '100',
      type: 'artist',
      icon: 'PeopleIcon',
      title: 'The Static Charms',
      link: '/libraries/20/artists/100',
      thumbSm: thumb100Sm,
    });
    expect(results[3]).toStrictEqual({
      score: 0.9,
      playlistId: '301',
      type: 'playlist',
      icon: 'PlaylistIcon',
      title: 'Deep Focus',
      link: '/libraries/20/playlists/301',
      thumbSm: `${serverBaseUrl}/photo/:/transcode?width=360&height=360&url=%2Flibrary%2Fplaylists%2F301%2Fcomposite%2F1712345678&minSize=1&X-Plex-Token=${accessToken}`,
    });
    expect(results[4]).toStrictEqual({
      score: 0.9,
      collectionId: '401',
      type: 'album collection',
      icon: 'AlbumCollectionsIcon',
      title: 'Best of 2020',
      link: '/libraries/20/album-collections/401',
      thumbSm: `${serverBaseUrl}/photo/:/transcode?width=360&height=360&url=%2Flibrary%2Fcollections%2F401%2Fcomposite%2F1712345600&minSize=1&X-Plex-Token=${accessToken}`,
    });
    expect(results[5]).toStrictEqual({
      score: 0.9,
      trackId: '5001',
      type: 'track',
      icon: 'MusicNoteSingleIcon',
      title: 'Opening Theme',
      // Track results link to their album
      link: '/libraries/20/albums/200',
      thumbSm: thumb200Sm,
    });
  });

  test('Returns null thumbs for results without a thumb', () => {
    expect(results[1].artistId).toBe('102');
    expect(results[1].thumbSm).toBeNull();
  });

  test('Excludes unsupported result types and hubs without metadata', () => {
    // The 'photo' result and the empty 'genre' hub are both dropped
    expect(results).toHaveLength(6);
    expect(results.map((result: { title: string }) => result.title)).not.toContain('Beach Day');
  });

  test('Returns an empty array for missing input', () => {
    expect(transposeSearchResultsArray(undefined, libraryId, serverBaseUrl, accessToken)).toEqual([]);
  });
});
