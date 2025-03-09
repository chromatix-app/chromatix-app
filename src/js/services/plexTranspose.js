/*
We are transposing the Plex data to a format that is easier to work with in the app and
consistent between music services, and also doing some additional processing and validation.
*/

// ======================================================================
// IMPORTS
// ======================================================================

import { XMLParser } from 'fast-xml-parser';

// ======================================================================
// OPTIONS
// ======================================================================

const thumbSizeSmall = 360;
const thumbSizeMedium = 600;
// const thumbPlaceholder = '/images/artwork-placeholder.png';

// ======================================================================
// HELPERS
// ======================================================================

const getThumb = (plexBaseUrl, thumb, size, accessToken) => {
  const finalThumb = thumb
    ? `${plexBaseUrl}/photo/:/transcode?width=${size}&height=${size}&url=${encodeURIComponent(
        thumb.split('?')[0]
      )}&minSize=1&X-Plex-Token=${accessToken}`
    : null;
  return finalThumb;
};

// ======================================================================
// USER
// ======================================================================

export const transposeUserData = (user) => {
  const parser = new XMLParser({ ignoreAttributes: false });
  const data = parser.parse(user.data).user;

  return {
    userId: data['@_id'],
    email: data['email'],
    thumb: data['@_thumb'],
    title: data['@_title'],
    username: data['username'],
  };
};

// ======================================================================
// SERVERS
// ======================================================================

export const transposeServerArray = (array) => {
  const data =
    array?.data?.filter((resource) => resource.provides === 'server')?.map((server) => transposeServerData(server)) ||
    [];
  return data;
};

export const transposeServerData = (server) => {
  return {
    serverId: server.clientIdentifier,
    name: server.name || 'Unknown Plex Server',
    accessToken: server.accessToken,
    connections: server.connections,
  };
};

// ======================================================================
// LIBRARIES
// ======================================================================

export const transposeLibraryArray = (array) => {
  const data = array?.data?.MediaContainer?.Directory?.filter((library) => library.type === 'artist').map((library) =>
    transposeLibraryData(library)
  );
  return data;
};

export const transposeLibraryData = (library) => {
  return {
    libraryId: library.key,
    title: library.title,
  };
};

// ======================================================================
// ARTISTS
// ======================================================================

export const transposeArtistArray = (array, libraryId, plexBaseUrl, accessToken) => {
  const data =
    array?.data?.MediaContainer?.Metadata?.map((artist) =>
      transposeArtistData(artist, libraryId, plexBaseUrl, accessToken)
    ) || [];
  return data;
};

export const transposeArtistDetails = (array, libraryId, plexBaseUrl, accessToken) => {
  const artist = array?.data?.MediaContainer?.Metadata[0];
  const artistDetails = transposeArtistData(artist, libraryId, plexBaseUrl, accessToken);
  return artistDetails;
};

export const transposeArtistRelatedArray = (array, libraryId, plexBaseUrl, accessToken) => {
  const data =
    array?.data?.MediaContainer?.Hub?.filter(
      (hub) => hub.type === 'album' && hub.Metadata && hub.context && hub.context.includes('hub.artist.albums')
    ).map((hub) => ({
      title: hub.title,
      related: hub.Metadata.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)),
    })) || [];
  return data;
};

export const transposeArtistAppearanceAlbumIdsArray = (array, libraryId, plexBaseUrl, accessToken) => {
  const artistCompilationTracks =
    array?.data?.MediaContainer?.Metadata?.map((track) =>
      transposeTrackData(track, libraryId, plexBaseUrl, accessToken)
    ) || [];
  // get a unique list of album IDs using the albumId key of each track
  const artistCompilationAlbums = [...new Set(artistCompilationTracks.map((track) => track.albumId))];
  return artistCompilationAlbums;
};

export const transposeArtistData = (artist, libraryId, plexBaseUrl, accessToken) => {
  return {
    kind: 'artist',
    libraryId: libraryId,
    artistId: artist.ratingKey,
    title: artist.title,
    addedAt: artist.addedAt,
    lastPlayed: artist.lastViewedAt,
    country: artist?.Country?.[0]?.tag,
    genre: artist?.Genre?.[0]?.tag,
    userRating: artist.userRating,
    link: '/artists/' + libraryId + '/' + artist.ratingKey,
    thumb: getThumb(plexBaseUrl, artist.thumb, thumbSizeSmall, accessToken),
    thumbMedium: getThumb(plexBaseUrl, artist.thumb, thumbSizeMedium, accessToken),
  };
};

// ======================================================================
// ALBUMS
// ======================================================================

export const transposeAlbumArray = (array, libraryId, plexBaseUrl, accessToken) => {
  const data =
    array?.data?.MediaContainer?.Metadata?.map((album) =>
      transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)
    ) || [];
  return data;
};

export const transposeAlbumDetails = (array, libraryId, plexBaseUrl, accessToken) => {
  const album = array?.data?.MediaContainer?.Metadata[0];
  const albumDetails = transposeAlbumData(album, libraryId, plexBaseUrl, accessToken);
  return albumDetails;
};

export const transposeAlbumData = (album, libraryId, plexBaseUrl, accessToken) => {
  return {
    kind: 'album',
    libraryId: libraryId,
    albumId: album.ratingKey,
    title: album.title,
    addedAt: album.addedAt,
    lastPlayed: album.lastViewedAt,
    artist: album.parentTitle,
    artistId: album.parentRatingKey,
    artistLink: '/artists/' + libraryId + '/' + album.parentRatingKey,
    userRating: album.userRating,
    releaseDate: album.originallyAvailableAt,
    link: '/albums/' + libraryId + '/' + album.ratingKey,
    thumb: getThumb(plexBaseUrl, album.thumb, thumbSizeSmall, accessToken),
    thumbMedium: getThumb(plexBaseUrl, album.thumb, thumbSizeMedium, accessToken),
  };
};

// ======================================================================
// FOLDERS
// ======================================================================

export const transposeFolderArray = (array, libraryId, plexBaseUrl, accessToken) => {
  const data =
    array?.data?.MediaContainer?.Metadata?.map((item) =>
      transposeFolderData(item, libraryId, plexBaseUrl, accessToken)
    ).filter((item) => item !== null) || [];

  // Sort folderItems
  data.sort((a, b) => {
    if (a.kind === 'folder' && b.kind === 'track') return -1;
    if (a.kind === 'track' && b.kind === 'folder') return 1;
    if (a.kind === 'folder' && b.kind === 'folder') return a.title.localeCompare(b.title);
    if (a.kind === 'track' && b.kind === 'track') {
      if (a.album !== b.album) return a.album.localeCompare(b.album);
      if (a.discNumber !== b.discNumber) return a.discNumber - b.discNumber;
      return a.trackNumber - b.trackNumber;
    }
    return 0;
  });

  // Add sortOrder properties to each object
  let trackSortOrder = 0;
  data.forEach((item, index) => {
    item.sortOrder = index;
    if (item.kind === 'track') {
      item.trackSortOrder = trackSortOrder;
      trackSortOrder++;
    }
  });

  return data;
};

export const transposeFolderData = (folder, libraryId, plexBaseUrl, accessToken) => {
  if (folder.ratingKey) {
    if (folder.type !== 'track') {
      return null;
    }
    return transposeTrackData(folder, libraryId, plexBaseUrl, accessToken);
  }

  const folderId = folder.key.split('?parent=')[1];
  return {
    kind: 'aaafolder', // "aaa" prefix to force folders to the top
    libraryId: libraryId,
    folderId: folderId,
    title: folder.title,
    link: '/folders/' + libraryId + '/' + folderId,
  };
};

// ======================================================================
// PLAYLISTS
// ======================================================================

export const transposePlaylistArray = (array, libraryId, plexBaseUrl, accessToken) => {
  const data =
    array?.data?.MediaContainer?.Metadata?.map((playlist) =>
      transposePlaylistData(playlist, libraryId, plexBaseUrl, accessToken)
    ) || [];
  return data;
};

export const transposePlaylistDetails = (array, libraryId, plexBaseUrl, accessToken) => {
  const playlist = array?.data?.MediaContainer?.Metadata[0];
  const playlistDetails = transposePlaylistData(playlist, libraryId, plexBaseUrl, accessToken);
  return playlistDetails;
};

export const transposePlaylistData = (playlist, libraryId, plexBaseUrl, accessToken) => {
  const playlistThumb = playlist.thumb ? playlist.thumb : playlist.composite ? playlist.composite : null;
  return {
    kind: 'playlist',
    libraryId: libraryId,
    playlistId: playlist.ratingKey,
    title: playlist.title,
    addedAt: playlist.addedAt,
    lastPlayed: playlist.lastViewedAt,
    userRating: playlist.userRating,
    link: '/playlists/' + libraryId + '/' + playlist.ratingKey,
    totalTracks: playlist.leafCount,
    duration: playlist.duration,
    thumb: getThumb(plexBaseUrl, playlistThumb, thumbSizeSmall, accessToken),
    thumbMedium: getThumb(plexBaseUrl, playlistThumb, thumbSizeMedium, accessToken),
  };
};

// ======================================================================
// COLLECTIONS
// ======================================================================

export const transposeCollectionArray = (array, libraryId, plexBaseUrl, accessToken) => {
  const allCollections =
    array?.data?.MediaContainer?.Metadata?.filter(
      (collection) => collection.subtype === 'artist' || collection.subtype === 'album'
    ).map((collection) => transposeCollectionData(collection, libraryId, plexBaseUrl, accessToken)) || [];
  const allArtistCollections = allCollections.filter((collection) => collection.type === 'artist');
  const allAlbumCollections = allCollections.filter((collection) => collection.type === 'album');
  return {
    allArtistCollections,
    allAlbumCollections,
  };
};

export const transposeCollectionItemArray = (array, libraryId, plexBaseUrl, accessToken, typeKey) => {
  console.log(typeKey);
  const data =
    array?.data?.MediaContainer?.Metadata?.map((item) =>
      lookups[`transpose${typeKey}Data`](item, libraryId, plexBaseUrl, accessToken)
    ) || [];
  console.log(data);
  return data;
};

export const transposeCollectionData = (collection, libraryId, plexBaseUrl, accessToken) => {
  const collectionThumb = collection.thumb ? collection.thumb : collection.composite ? collection.composite : null;
  return {
    kind: 'collection',
    libraryId: libraryId,
    collectionId: collection.ratingKey,
    title: collection.title,
    addedAt: collection.addedAt,
    userRating: collection.userRating,
    type: collection.subtype,
    link:
      (collection.subtype === 'artist' ? '/artist-collections/' : '/album-collections/') +
      libraryId +
      '/' +
      collection.ratingKey,
    thumb: getThumb(plexBaseUrl, collectionThumb, thumbSizeSmall, accessToken),
    thumbMedium: getThumb(plexBaseUrl, collectionThumb, thumbSizeMedium, accessToken),
  };
};

// ======================================================================
// TAGS
// ======================================================================

const tagOptions = {
  AlbumGenres: { primaryKey: 'album', secondaryKey: 'Genre' },
  AlbumMoods: { primaryKey: 'album', secondaryKey: 'Mood' },
  AlbumStyles: { primaryKey: 'album', secondaryKey: 'Style' },
  ArtistGenres: { primaryKey: 'artist', secondaryKey: 'Genre' },
  ArtistMoods: { primaryKey: 'artist', secondaryKey: 'Mood' },
  ArtistStyles: { primaryKey: 'artist', secondaryKey: 'Style' },
};

const tagItemOptions = {
  AlbumGenreItems: { primaryKey: 'Album' },
  AlbumMoodItems: { primaryKey: 'Album' },
  AlbumStyleItems: { primaryKey: 'Album' },
  ArtistGenreItems: { primaryKey: 'Artist' },
  ArtistMoodItems: { primaryKey: 'Artist' },
  ArtistStyleItems: { primaryKey: 'Artist' },
};

export const transposeTagArray = (array, libraryId, typeKey) => {
  const { primaryKey, secondaryKey } = tagOptions[typeKey];
  const data =
    array?.data?.MediaContainer?.Directory?.map((entry) =>
      lookups[`transpose${secondaryKey}Data`](primaryKey, entry, libraryId)
    ) || [];
  return data;
};

export const transposeTagItemArray = (array, libraryId, plexBaseUrl, accessToken, typeKey) => {
  const { primaryKey } = tagItemOptions[typeKey];
  const data =
    array?.data?.MediaContainer?.Metadata?.map((entry) =>
      lookups[`transpose${primaryKey}Data`](entry, libraryId, plexBaseUrl, accessToken)
    ) || [];
  return data;
};

export const transposeGenreData = (type, genre, libraryId) => {
  return {
    kind: 'genre',
    libraryId: libraryId,
    genreId: genre.key,
    title: genre.title.replace(/\//g, ' & '),
    link: '/' + type + '-genres/' + libraryId + '/' + genre.key,
  };
};

export const transposeMoodData = (type, mood, libraryId) => {
  return {
    kind: 'mood',
    libraryId: libraryId,
    moodId: mood.key,
    title: mood.title.replace(/\//g, ' & '),
    link: '/' + type + '-moods/' + libraryId + '/' + mood.key,
  };
};

export const transposeStyleData = (type, style, libraryId) => {
  return {
    kind: 'style',
    libraryId: libraryId,
    styleId: style.key,
    title: style.title.replace(/\//g, ' & '),
    link: '/' + type + '-styles/' + libraryId + '/' + style.key,
  };
};

// ======================================================================
// TRACKS
// ======================================================================

export const transposeTrackArray = (array, libraryId, plexBaseUrl, accessToken) => {
  const data =
    array?.data?.MediaContainer?.Metadata?.map((track) =>
      transposeTrackData(track, libraryId, plexBaseUrl, accessToken)
    ) || [];
  return data;
};

export const transposeTrackData = (track, libraryId, plexBaseUrl, accessToken) => {
  const isLikelyCompilation = track.originalTitle && track.originalTitle !== track.grandparentTitle;

  const artistTitle = isLikelyCompilation ? track.originalTitle : track.grandparentTitle;
  const artistLink = isLikelyCompilation ? null : '/artists/' + libraryId + '/' + track.grandparentRatingKey;

  return {
    kind: 'track',
    libraryId: libraryId,
    trackId: track.ratingKey,
    trackKey: track.key,
    title: track.title,
    // addedAt: track.addedAt,
    artist: artistTitle,
    artistLink: artistLink,
    album: track.parentTitle,
    albumId: track.parentRatingKey,
    albumLink: '/albums/' + libraryId + '/' + track.parentRatingKey,
    trackNumber: track.index,
    discNumber: track.parentIndex,
    duration: track.Media[0].duration,
    userRating: track.userRating,
    thumb: getThumb(plexBaseUrl, track.thumb, thumbSizeSmall, accessToken),
    thumbMedium: getThumb(plexBaseUrl, track.thumb, thumbSizeMedium, accessToken),
    src: `${plexBaseUrl}${track.Media[0].Part[0].key}?X-Plex-Token=${accessToken}`,
  };
};

// ======================================================================
// SEARCH RESULTS
// ======================================================================

const typeOrder = {
  artist: 1,
  album: 2,
  playlist: 3,
  'artist collection': 4,
  'album collection': 5,
  track: 6,
};

export const transposeSearchResultsArray = (array, libraryId, plexBaseUrl, accessToken) => {
  const data =
    array?.data?.MediaContainer?.Hub?.flatMap((result) => result.Metadata)
      ?.map((result) => transposeHubSearchResultData(result, libraryId, plexBaseUrl, accessToken))
      .filter((result) => result !== null)
      .sort((a, b) => {
        if (b.score === a.score) {
          if (a.type === b.type) {
            return a.title.localeCompare(b.title);
          }
          return typeOrder[a.type] - typeOrder[b.type];
        }
        return b.score - a.score;
      }) || [];
  return data;
};

export const transposeHubSearchResultData = (result, libraryId, plexBaseUrl, accessToken) => {
  if (result?.type) {
    if (result.type === 'artist') {
      return {
        score: result.score,
        artistId: result.ratingKey,
        type: 'artist',
        icon: 'PeopleIcon',
        title: result.title,
        link: '/artists/' + libraryId + '/' + result.ratingKey,
        thumb: getThumb(plexBaseUrl, result.thumb, thumbSizeSmall, accessToken),
      };
    } else if (result.type === 'album') {
      return {
        score: result.score,
        albumId: result.ratingKey,
        type: 'album',
        icon: 'PlayCircleIcon',
        title: result.title,
        link: '/albums/' + libraryId + '/' + result.ratingKey,

        thumb: getThumb(plexBaseUrl, result.thumb, thumbSizeSmall, accessToken),
      };
    } else if (result.type === 'playlist') {
      const playlistThumb = result.thumb ? result.thumb : result.composite ? result.composite : null;
      return {
        score: result.score,
        playlistId: result.ratingKey,
        type: 'playlist',
        icon: 'PlaylistIcon',
        title: result.title,
        link: '/playlists/' + libraryId + '/' + result.ratingKey,
        thumb: getThumb(plexBaseUrl, playlistThumb, thumbSizeSmall, accessToken),
      };
    } else if (result.type === 'collection') {
      const collectionThumb = result.thumb ? result.thumb : result.composite ? result.composite : null;
      return {
        score: result.score,
        collectionId: result.ratingKey,
        type: result.subtype + ' collection',
        icon: result.subtype === 'artist' ? 'ArtistCollectionsIcon' : 'AlbumCollectionsIcon',
        title: result.title,
        link:
          (result.subtype === 'artist' ? '/artist-collections/' : '/album-collections/') +
          libraryId +
          '/' +
          result.ratingKey,
        thumb: getThumb(plexBaseUrl, collectionThumb, thumbSizeSmall, accessToken),
      };
    } else if (result.type === 'track') {
      return {
        score: result.score,
        trackId: result.ratingKey,
        type: 'track',
        icon: 'MusicNoteSingleIcon',
        title: result.title,
        link: '/albums/' + libraryId + '/' + result.parentRatingKey,

        thumb: getThumb(plexBaseUrl, result.thumb, thumbSizeSmall, accessToken),
      };
    }
  }

  return null;
};

// export const transposeLibrarySearchData = (result, libraryId, libraryTitle, plexBaseUrl, accessToken) => {
//   if (result?.Metadata?.type) {
//     const meta = result.Metadata;
//     if (meta.librarySectionTitle !== libraryTitle) {
//       return null;
//     } else if (meta.type === 'artist') {
//       return {
//         score: result.score,
//         type: 'artist',
//         icon: 'PeopleIcon',
//         title: meta.title,
//         link: '/artists/' + libraryId + '/' + meta.ratingKey,
//         thumb: meta.thumb
//           ? `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeSmall}&height=${thumbSizeSmall}&url=${encodeURIComponent(
//               meta.thumb
//             )}&minSize=1&X-Plex-Token=${accessToken}`
//           : thumbPlaceholder,
//       };
//     } else if (meta.type === 'album') {
//       return {
//         score: result.score,
//         type: 'album',
//         icon: 'PlayCircleIcon',
//         title: meta.title,
//         link: '/albums/' + libraryId + '/' + meta.ratingKey,
//         thumb: meta.thumb
//           ? `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeSmall}&height=${thumbSizeSmall}&url=${encodeURIComponent(
//               meta.thumb
//             )}&minSize=1&X-Plex-Token=${accessToken}`
//           : thumbPlaceholder,
//       };
//     } else if (meta.type === 'playlist') {
//       const playlistThumb = meta.thumb ? meta.thumb : meta.composite ? meta.composite : null;
//       return {
//         score: result.score,
//         type: 'playlist',
//         icon: 'MusicNoteDoubleIcon',
//         title: meta.title,
//         link: '/playlists/' + libraryId + '/' + meta.ratingKey,
//         thumb: playlistThumb
//           ? `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeSmall}&height=${thumbSizeSmall}&url=${encodeURIComponent(
//               playlistThumb
//             )}&minSize=1&X-Plex-Token=${accessToken}`
//           : thumbPlaceholder,
//       };
//     } else if (meta.type === 'collection') {
//       const collectionThumb = meta.thumb ? meta.thumb : meta.composite ? meta.composite : null;
//       return {
//         score: result.score,
//         type: meta.subtype + ' collection',
//         icon: meta.subtype === 'artist' ? 'ArtistCollectionsIcon' : 'AlbumCollectionsIcon',
//         title: meta.title,
//         link:
//           (meta.subtype === 'artist' ? '/artist-collections/' : '/album-collections/') +
//           libraryId +
//           '/' +
//           meta.ratingKey,
//         thumb: collectionThumb
//           ? `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeSmall}&height=${thumbSizeSmall}&url=${encodeURIComponent(
//               collectionThumb
//             )}&minSize=1&X-Plex-Token=${accessToken}`
//           : thumbPlaceholder,
//       };
//     } else if (meta.type === 'track') {
//       return {
//         score: result.score,
//         type: 'track',
//         icon: 'MusicNoteSingleIcon',
//         title: meta.title,
//         link: '/albums/' + libraryId + '/' + meta.parentRatingKey,
//         thumb: meta.thumb
//           ? `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeSmall}&height=${thumbSizeSmall}&url=${encodeURIComponent(
//               meta.thumb
//             )}&minSize=1&X-Plex-Token=${accessToken}`
//           : thumbPlaceholder,
//       };
//     }
//   }
//   // else if (result?.Directory?.type) {
//   //   const directory = result.Directory;
//   //   if (directory.type === 'tag') {
//   //   }
//   // }

//   return null;
// };

// ======================================================================
// DYNAMIC LOOKUPS
// ======================================================================

const lookups = {
  transposeArtistData,
  transposeAlbumData,
  transposeGenreData,
  transposeMoodData,
  transposeStyleData,
};
