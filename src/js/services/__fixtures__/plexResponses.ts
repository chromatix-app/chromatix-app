// Generated using Claude Code

// Raw Plex API response payloads for use in tests.
// Each constant is shaped like the axios response the transpose functions
// receive ({ data: ... }), mirroring what the (undocumented) Plex API
// returns, trimmed to the fields Chromatix actually reads.

// ======================================================================
// SHARED METADATA ENTRIES
// ======================================================================

const albumElectricNights = {
  ratingKey: '200',
  key: '/library/metadata/200/children',
  type: 'album',
  title: 'Electric Nights',
  parentTitle: 'The Static Charms',
  parentRatingKey: '100',
  Genre: [{ tag: 'Electronic' }, { tag: 'Synthpop' }],
  addedAt: 1700000001,
  lastViewedAt: 1712000001,
  userRating: 9,
  originallyAvailableAt: '2020-05-15',
  thumb: '/library/metadata/200/thumb/1712345678',
};

const albumCompilation = {
  ratingKey: '201',
  key: '/library/metadata/201/children',
  type: 'album',
  title: 'Compilation Vol. 1',
  parentTitle: 'Various Artists',
  parentRatingKey: '101',
  addedAt: 1690000000,
};

const albumLiveAtTheRoundhouse = {
  ratingKey: '210',
  key: '/library/metadata/210/children',
  type: 'album',
  title: 'Live at the Roundhouse',
  parentTitle: 'The Static Charms',
  parentRatingKey: '100',
  addedAt: 1695000000,
  originallyAvailableAt: '2022-11-04',
  thumb: '/library/metadata/210/thumb/1713000000',
};

// Minimal-but-valid track entry, as returned by folder (by-folder browse) endpoints.
const folderTrack = (options: {
  ratingKey: string;
  title: string;
  album: string;
  albumId: string;
  discNumber: number;
  trackNumber: number;
}) => ({
  ratingKey: options.ratingKey,
  key: `/library/metadata/${options.ratingKey}`,
  type: 'track',
  title: options.title,
  grandparentTitle: 'Analog Archive',
  grandparentRatingKey: '102',
  parentTitle: options.album,
  parentRatingKey: options.albumId,
  index: options.trackNumber,
  parentIndex: options.discNumber,
  Media: [
    {
      audioCodec: 'mp3',
      container: 'mp3',
      bitrate: 320,
      duration: 180000,
      Part: [{ key: `/library/parts/${options.ratingKey}/file.mp3` }],
    },
  ],
});

// ======================================================================
// ALL USERS — plex.tv home users (no MediaContainer wrapper)
// ======================================================================

export const PLEX_ALL_USERS_RESPONSE = {
  data: {
    users: [
      {
        id: 111,
        uuid: 'uuid-adam',
        title: 'Adam',
        username: 'adamd',
        email: 'adam@example.com',
        admin: true,
        guest: false,
        protected: true,
        thumb: 'https://plex.tv/users/uuid-adam/avatar?c=1712345678',
      },
      {
        id: 222,
        uuid: 'uuid-kid',
        title: '',
        username: 'kiddo',
        email: '',
        admin: false,
        guest: false,
        protected: false,
        restrictionProfile: 'little_kid',
        thumb: 'https://plex.tv/users/uuid-kid/avatar?c=1712345678',
      },
    ],
  },
};

// ======================================================================
// USER — plex.tv account (no MediaContainer wrapper)
// ======================================================================

export const PLEX_USER_RESPONSE = {
  data: {
    id: 111,
    uuid: 'uuid-adam',
    title: 'Adam',
    username: 'adamd',
    email: 'adam@example.com',
    thumb: 'https://plex.tv/users/uuid-adam/avatar?c=1712345678',
  },
};

// ======================================================================
// SERVERS — plex.tv resources (data is a plain array)
// ======================================================================

export const PLEX_RESOURCES_RESPONSE = {
  data: [
    {
      name: 'Home Server',
      provides: 'server',
      clientIdentifier: 'abc123',
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
    },
    {
      provides: 'server',
      clientIdentifier: 'def456',
      accessToken: 'server-token-2',
      connections: [],
    },
    {
      name: 'Living Room TV',
      provides: 'client,player,pubsub-player',
      clientIdentifier: 'tv-1',
    },
  ],
};

// ======================================================================
// LIBRARIES
// ======================================================================

export const PLEX_LIBRARIES_RESPONSE = {
  data: {
    MediaContainer: {
      size: 3,
      Directory: [
        { key: '20', type: 'artist', title: 'Music' },
        { key: '2', type: 'movie', title: 'Movies' },
        { key: '21', type: 'artist', title: 'Classical' },
      ],
    },
  },
};

// ======================================================================
// ARTISTS
// ======================================================================

export const PLEX_ARTISTS_RESPONSE = {
  data: {
    MediaContainer: {
      size: 2,
      Metadata: [
        {
          ratingKey: '100',
          key: '/library/metadata/100/children',
          type: 'artist',
          title: 'The Static Charms',
          Genre: [{ tag: 'Electronic' }],
          Country: [{ tag: 'United Kingdom' }],
          addedAt: 1680000000,
          lastViewedAt: 1711000000,
          userRating: 8,
          thumb: '/library/metadata/100/thumb/1711111111',
        },
        {
          ratingKey: '101',
          key: '/library/metadata/101/children',
          type: 'artist',
          title: 'Various Artists',
          addedAt: 1670000000,
        },
      ],
    },
  },
};

export const PLEX_ARTIST_RELATED_RESPONSE = {
  data: {
    MediaContainer: {
      size: 1,
      Metadata: [
        {
          ratingKey: '100',
          type: 'artist',
          title: 'The Static Charms',
          Related: {
            Hub: [
              {
                type: 'album',
                context: 'hub.artist.albums',
                title: 'Albums',
                Metadata: [albumElectricNights],
              },
              {
                type: 'album',
                context: 'hub.artist.albums.live',
                title: 'Live Albums, Singles & EPs',
                Metadata: [albumLiveAtTheRoundhouse],
              },
              {
                // No Metadata — must be excluded
                type: 'album',
                context: 'hub.artist.albums.compilations',
                title: 'Compilations',
              },
              {
                // Wrong type — must be excluded
                type: 'artist',
                context: 'hub.artist.similar',
                title: 'Similar Artists',
                Metadata: [{ ratingKey: '103', type: 'artist', title: 'Night Bus Collective' }],
              },
            ],
          },
        },
      ],
    },
  },
};

// ======================================================================
// ALBUMS
// ======================================================================

export const PLEX_ALBUMS_RESPONSE = {
  data: {
    MediaContainer: {
      size: 2,
      Metadata: [albumElectricNights, albumCompilation],
    },
  },
};

// ======================================================================
// FOLDERS
// ======================================================================

export const PLEX_FOLDERS_RESPONSE = {
  data: {
    MediaContainer: {
      size: 4,
      Metadata: [
        folderTrack({
          ratingKey: '6001',
          title: 'Rehearsal Take',
          album: 'Reel One',
          albumId: '202',
          discNumber: 1,
          trackNumber: 1,
        }),
        // Non-track metadata row — must be excluded
        { ratingKey: '203', key: '/library/metadata/203/children', type: 'album', title: 'Stray Album Row' },
        { key: '/library/sections/20/all?parent=42', title: 'Zeta Sessions' },
        { key: '/library/sections/20/all?parent=43', title: 'Alpha Takes' },
      ],
    },
  },
};

export const PLEX_FOLDER_TRACKS_RESPONSE = {
  data: {
    MediaContainer: {
      size: 4,
      Metadata: [
        folderTrack({
          ratingKey: '6101',
          title: 'Late Album Opener',
          album: 'Zebra Crossing',
          albumId: '250',
          discNumber: 1,
          trackNumber: 1,
        }),
        folderTrack({
          ratingKey: '6102',
          title: 'Second Disc Opener',
          album: 'Aurora',
          albumId: '251',
          discNumber: 2,
          trackNumber: 1,
        }),
        folderTrack({
          ratingKey: '6103',
          title: 'First Disc Closer',
          album: 'Aurora',
          albumId: '251',
          discNumber: 1,
          trackNumber: 2,
        }),
        folderTrack({
          ratingKey: '6104',
          title: 'First Disc Opener',
          album: 'Aurora',
          albumId: '251',
          discNumber: 1,
          trackNumber: 1,
        }),
      ],
    },
  },
};

// ======================================================================
// PLAYLISTS
// ======================================================================

export const PLEX_PLAYLISTS_RESPONSE = {
  data: {
    MediaContainer: {
      size: 4,
      Metadata: [
        {
          ratingKey: '300',
          key: '/playlists/300/items',
          type: 'playlist',
          title: 'Morning Coffee',
          addedAt: 1701000000,
          lastViewedAt: 1712500000,
          userRating: 10,
          leafCount: 25,
          duration: 5400000,
          thumb: '/library/metadata/300/thumb/1712000000',
          composite: '/playlists/300/composite/1712345678',
        },
        {
          ratingKey: '301',
          key: '/playlists/301/items',
          type: 'playlist',
          title: 'Deep Focus',
          leafCount: 40,
          duration: 9000000,
          composite: '/library/playlists/301/composite/1712345678',
        },
        {
          ratingKey: '302',
          key: '/playlists/302/items',
          type: 'playlist',
          title: 'Workout',
          leafCount: 12,
          duration: 2400000,
          composite: '/library/playlists/302/composite/1712345678///',
        },
        {
          ratingKey: '303',
          key: '/playlists/303/items',
          type: 'playlist',
          title: 'New Playlist',
          leafCount: 0,
          duration: 0,
        },
      ],
    },
  },
};

// ======================================================================
// COLLECTIONS
// ======================================================================

export const PLEX_COLLECTIONS_RESPONSE = {
  data: {
    MediaContainer: {
      size: 3,
      Metadata: [
        {
          ratingKey: '400',
          type: 'collection',
          subtype: 'artist',
          title: 'Favourite Artists',
          addedAt: 1699000000,
          userRating: 7,
          thumb: '/library/collections/400/thumb/1712345000',
        },
        {
          ratingKey: '401',
          type: 'collection',
          subtype: 'album',
          title: 'Best of 2020',
          addedAt: 1698000000,
          composite: '/library/collections/401/composite/1712345600',
        },
        {
          // Unsupported subtype — must be excluded
          ratingKey: '402',
          type: 'collection',
          subtype: 'photo',
          title: 'Holiday Snaps',
          addedAt: 1697000000,
        },
      ],
    },
  },
};

// ======================================================================
// TAGS
// ======================================================================

export const PLEX_TAGS_RESPONSE = {
  data: {
    MediaContainer: {
      size: 2,
      Directory: [
        { key: '9001', title: 'Rock/Pop' },
        { key: '9002', title: 'Jazz' },
      ],
    },
  },
};

// ======================================================================
// TRACKS
// ======================================================================

export const PLEX_TRACKS_RESPONSE = {
  data: {
    MediaContainer: {
      size: 4,
      Metadata: [
        {
          // Standard album track
          ratingKey: '5001',
          key: '/library/metadata/5001',
          type: 'track',
          title: 'Opening Theme',
          grandparentTitle: 'The Static Charms',
          grandparentRatingKey: '100',
          parentTitle: 'Electric Nights',
          parentRatingKey: '200',
          parentYear: 2020,
          index: 1,
          parentIndex: 1,
          userRating: 10,
          thumb: '/library/metadata/200/thumb/1712345678',
          Media: [
            {
              id: 7001,
              audioCodec: 'flac',
              container: 'flac',
              bitrate: 1043,
              duration: 215000,
              Part: [{ id: 8001, key: '/library/parts/9001/1650000001/file.flac' }],
            },
          ],
        },
        {
          // Appearance track — originalTitle differs from grandparentTitle;
          // no thumb, no parentYear, no userRating
          ratingKey: '5002',
          key: '/library/metadata/5002',
          type: 'track',
          title: 'Guest Spot',
          originalTitle: 'The Featured Act',
          grandparentTitle: 'Various Artists',
          grandparentRatingKey: '101',
          parentTitle: 'Compilation Vol. 1',
          parentRatingKey: '201',
          index: 2,
          parentIndex: 1,
          Media: [
            {
              id: 7002,
              audioCodec: 'wmav2',
              container: 'asf',
              bitrate: 192,
              duration: 180000,
              Part: [{ id: 8002, key: '/library/parts/9002/1650000002/file.wma' }],
            },
          ],
        },
        {
          // originalTitle matches grandparentTitle; thumb has a query string
          ratingKey: '5003',
          key: '/library/metadata/5003',
          type: 'track',
          title: 'Night Drive',
          originalTitle: 'The Static Charms',
          grandparentTitle: 'The Static Charms',
          grandparentRatingKey: '100',
          parentTitle: 'Electric Nights',
          parentRatingKey: '200',
          parentYear: 2020,
          index: 3,
          parentIndex: 1,
          userRating: 6,
          thumb: '/library/metadata/200/thumb/1712345678?X-Plex-Token=stale-token',
          Media: [
            {
              id: 7003,
              audioCodec: 'pcm',
              container: 'wav',
              bitrate: 1411,
              duration: 95000,
              Part: [{ id: 8003, key: '/library/parts/9003/1650000003/file.wav' }],
            },
          ],
        },
        {
          // Playlist item on disc 2
          ratingKey: '5004',
          key: '/library/metadata/5004',
          type: 'track',
          playlistItemID: 90004,
          title: 'Tape Restoration',
          grandparentTitle: 'Analog Archive',
          grandparentRatingKey: '102',
          parentTitle: 'Reel One',
          parentRatingKey: '202',
          parentYear: 1974,
          index: 4,
          parentIndex: 2,
          userRating: 4,
          thumb: '/library/metadata/202/thumb/1710000000',
          Media: [
            {
              id: 7004,
              audioCodec: 'pcm',
              container: 'aiff',
              bitrate: 1411,
              duration: 320000,
              Part: [{ id: 8004, key: '/library/parts/9004/1650000004/file.aiff' }],
            },
          ],
        },
      ],
    },
  },
};

// ======================================================================
// SEARCH RESULTS
// ======================================================================

export const PLEX_SEARCH_RESPONSE = {
  data: {
    MediaContainer: {
      Hub: [
        {
          type: 'artist',
          title: 'Artists',
          Metadata: [
            {
              ratingKey: '100',
              type: 'artist',
              score: 0.9,
              title: 'The Static Charms',
              thumb: '/library/metadata/100/thumb/1711111111',
            },
            { ratingKey: '102', type: 'artist', score: 0.9, title: 'Analog Archive' },
          ],
        },
        {
          type: 'album',
          title: 'Albums',
          Metadata: [
            {
              ratingKey: '200',
              type: 'album',
              score: 0.95,
              title: 'Electric Nights',
              thumb: '/library/metadata/200/thumb/1712345678',
            },
          ],
        },
        {
          type: 'track',
          title: 'Tracks',
          Metadata: [
            {
              ratingKey: '5001',
              parentRatingKey: '200',
              type: 'track',
              score: 0.9,
              title: 'Opening Theme',
              thumb: '/library/metadata/200/thumb/1712345678',
            },
          ],
        },
        {
          type: 'playlist',
          title: 'Playlists',
          Metadata: [
            {
              ratingKey: '301',
              type: 'playlist',
              score: 0.9,
              title: 'Deep Focus',
              composite: '/library/playlists/301/composite/1712345678',
            },
          ],
        },
        {
          type: 'collection',
          title: 'Collections',
          Metadata: [
            {
              ratingKey: '401',
              type: 'collection',
              subtype: 'album',
              score: 0.9,
              title: 'Best of 2020',
              composite: '/library/collections/401/composite/1712345600',
            },
          ],
        },
        {
          // Unsupported result type — must be excluded
          type: 'photo',
          title: 'Photos',
          Metadata: [{ ratingKey: '9999', type: 'photo', score: 0.99, title: 'Beach Day' }],
        },
        {
          // Hub without Metadata — must be excluded
          type: 'genre',
          title: 'Genres',
        },
      ],
    },
  },
};

// ======================================================================
// EMPTY
// ======================================================================

export const PLEX_EMPTY_RESPONSE = {
  data: {
    MediaContainer: {
      size: 0,
    },
  },
};
