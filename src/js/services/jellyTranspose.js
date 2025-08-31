/*
We are transposing the API data to a format that is easier to work with in the app and
consistent between music services, and also doing some additional processing and validation.
*/

// ======================================================================
// IMPORTS
// ======================================================================

import { safeEncodeURIComponent } from 'js/utils/';

// ======================================================================
// OPTIONS
// ======================================================================

const thumbSizeSmall = 360;
const thumbSizeMedium = 680;

// ======================================================================
// HELPERS
// ======================================================================

const getUserImage = (primaryImageTag, serverBaseUrl, accessToken, userId) => {
  if (!primaryImageTag) {
    return null;
  }
  return `${serverBaseUrl}/Users/${userId}/Images/Primary?tag=${primaryImageTag}`;
  // &api_key=${accessToken}
};

const getThumb = (entry, serverBaseUrl, accessToken, size) => {
  let entryId;
  let imageKey;
  let thumbImageTag;

  // Try Primary first
  if (entry.ImageTags && entry.ImageTags?.Primary) {
    entryId = entry.Id;
    imageKey = 'Primary';
    thumbImageTag = entry.ImageTags?.Primary;
  }

  // Next, try AlbumPrimaryImageTag (tracks only)
  if (!thumbImageTag && entry.AlbumId && entry.AlbumPrimaryImageTag) {
    entryId = entry.AlbumId;
    imageKey = 'Primary';
    thumbImageTag = entry.AlbumPrimaryImageTag;
  }

  // Next, try Backdrop
  if (!thumbImageTag && entry.BackdropImageTags && entry.BackdropImageTags?.[0]) {
    entryId = entry.Id;
    imageKey = 'Backdrop';
    thumbImageTag = entry.BackdropImageTags?.[0];
  }

  // // Next, try ParentImageTags
  // if (!thumbImageTag && entry.ParentImageTags && entry.ParentImageTags?.Primary) {
  //   entryId = entry.Id;
  //   imageKey = 'Primary';
  //   thumbImageTag = entry.ParentImageTags?.Primary;
  // }

  // Next, try ParentBackdropImageTags (tracks only)
  if (!thumbImageTag && entry.AlbumId && entry.ParentBackdropImageTags && entry.ParentBackdropImageTags?.[0]) {
    entryId = entry.AlbumId;
    imageKey = 'Backdrop';
    thumbImageTag = entry.ParentBackdropImageTags?.[0];
  }

  // // Fallback to Logo if Primary doesn't exist
  // if (!thumbImageTag && entry.ImageTags && entry.ImageTags?.Logo) {
  //   entryId = entry.Id;
  //   imageKey = 'Logo';
  //   thumbImageTag = entry.ImageTags?.Logo;
  // }

  // // Fallback to first available entry if neither Primary nor Logo exist
  // if (!thumbImageTag && imageList) {
  //   const firstKey = Object.keys(imageList)[0];
  //   thumbImageTag = firstKey ? imageList[firstKey] : null;
  // }

  if (!thumbImageTag) {
    return null;
  }

  return `${serverBaseUrl}/Items/${entryId}/Images/${imageKey}?fillHeight=${size}&fillWidth=${size}&quality=96&tag=${thumbImageTag}`;
  // &api_key=${accessToken}
};

// ======================================================================
// USER
// ======================================================================

export const transposeUserData = (data, serverBaseUrl, accessToken, userId) => {
  // console.log(user?.data);
  const user = data?.data;
  return {
    userId: user.Id,
    email: null,
    thumb: getUserImage(user.PrimaryImageTag, serverBaseUrl, accessToken, userId),
    username: user.Name,
    serverBaseUrl,
  };
};

// ======================================================================
// SERVERS
// ======================================================================

export const transposeServerData = (data, accessToken) => {
  // console.log(data?.data);
  const server = data?.data;
  return [
    {
      serverId: server.Id,
      name: server.ServerName || 'Unknown Jellyfin Server',
      accessToken: accessToken,
      connections: server.connections,
    },
  ];
};

// ======================================================================
// LIBRARIES
// ======================================================================

export const transposeLibraryArray = (array) => {
  const data = array?.data?.Items?.filter((library) => library.CollectionType === 'music').map((library) =>
    transposeLibraryData(library)
  );
  return data;
};

const transposeLibraryData = (library) => {
  return {
    libraryId: library.Id,
    title: library.Name,
  };
};

// ======================================================================
// ARTISTS
// ======================================================================

export const transposeArtistArray = (array, libraryId, serverBaseUrl, accessToken) => {
  // console.log(array?.data?.Items);
  const data =
    array?.data?.Items?.map((artist) => transposeArtistData(artist, libraryId, serverBaseUrl, accessToken)) || [];
  return data;
};

export const transposeAlbumArtistArray = (array, libraryId, serverBaseUrl, accessToken) => {
  // console.log(array?.data?.Items);
  const data =
    array?.data?.Items?.map((artist) =>
      transposeArtistData(artist, libraryId, serverBaseUrl, accessToken, '/album-artists/')
    ) || [];
  return data;
};

export const transposeArtistDetails = (array, libraryId, serverBaseUrl, accessToken) => {
  // console.log(array?.data);
  const artist = array?.data;
  const artistDetails = transposeArtistData(artist, libraryId, serverBaseUrl, accessToken);
  return artistDetails;
};

// export const transposeArtistRelatedArray = (array, libraryId, serverBaseUrl, accessToken) => {
//   const data =
//     // array?.data?.MediaContainer?.Hub?.filter(
//     array?.data?.MediaContainer?.Metadata?.[0]?.Related?.Hub?.filter(
//       (hub) => hub.type === 'album' && hub.Metadata && hub.context && hub.context.includes('hub.artist.albums')
//     ).map((hub) => ({
//       title: hub.title,
//       related: hub.Metadata.map((album) => transposeAlbumData(album, libraryId, serverBaseUrl, accessToken)),
//     })) || [];
//   return data;
// };

// export const transposeArtistAppearanceAlbumIdsArray = (array, libraryId, serverBaseUrl, accessToken) => {
//   const artistAppearanceTracks =
//     array?.data?.MediaContainer?.Metadata?.map((track) => transposeTrackData(track, libraryId, serverBaseUrl, accessToken)) ||
//     [];
//   // get a unique list of album IDs using the albumId key of each track
//   const artistAppearanceAlbums = [...new Set(artistAppearanceTracks.map((track) => track.albumId))];
//   return artistAppearanceAlbums;
// };

const transposeArtistData = (artist, libraryId, serverBaseUrl, accessToken, baseUrl = '/artists/') => {
  return {
    kind: 'artist',
    libraryId: libraryId,
    artistId: artist.Id,
    title: artist.Name,
    genre: artist?.Genres?.[0],
    country: null,
    addedAt: null, // artist.DateCreated ? new Date(artist.DateCreated).getTime() / 1000 : null,
    lastPlayed: null,
    userRating: null,
    isFavourite: artist.UserData?.IsFavorite || false,
    link: baseUrl + libraryId + '/' + artist.Id,
    thumb: getThumb(artist, serverBaseUrl, accessToken, thumbSizeSmall),
    thumbMedium: getThumb(artist, serverBaseUrl, accessToken, thumbSizeMedium),
  };
};

// ======================================================================
// ALBUMS
// ======================================================================

export const transposeAlbumArray = (array, libraryId, serverBaseUrl, accessToken) => {
  // console.log(array?.data?.Items);
  const data =
    array?.data?.Items?.map((album) => transposeAlbumData(album, libraryId, serverBaseUrl, accessToken)) || [];
  return data;
};

export const transposeAlbumDetails = (array, libraryId, serverBaseUrl, accessToken) => {
  // console.log(array?.data);
  const album = array?.data;
  const albumDetails = transposeAlbumData(album, libraryId, serverBaseUrl, accessToken);
  return albumDetails;
};

const transposeAlbumData = (album, libraryId, serverBaseUrl, accessToken) => {
  const artistName = album.AlbumArtist;
  const artistId =
    album.AlbumArtists?.filter((artist) => artist.Name === artistName)[0]?.Id || album.AlbumArtists?.[0]?.Id || null;

  return {
    kind: 'album',
    libraryId: libraryId,
    albumId: album.Id,
    title: album.Name,
    artist: artistName,
    artistId: artistId,
    artistLink: '/artists/' + libraryId + '/' + artistId,
    genre: album?.Genres?.[0],
    addedAt: null,
    lastPlayed: null,
    userRating: null,
    isFavourite: album.UserData?.IsFavorite || false,
    releaseDate: album.PremiereDate,
    link: '/albums/' + libraryId + '/' + album.Id,
    thumb: getThumb(album, serverBaseUrl, accessToken, thumbSizeSmall),
    thumbMedium: getThumb(album, serverBaseUrl, accessToken, thumbSizeMedium),
  };
};

// ======================================================================
// FOLDERS
// ======================================================================

// export const transposeFolderArray = (array, libraryId, serverBaseUrl, accessToken) => {
//   const data =
//     array?.data?.MediaContainer?.Metadata?.map((item) =>
//       transposeFolderData(item, libraryId, serverBaseUrl, accessToken)
//     ).filter((item) => item !== null) || [];

//   // Sort folderItems
//   data.sort((a, b) => {
//     if (a.kind === 'folder' && b.kind === 'track') return -1;
//     if (a.kind === 'track' && b.kind === 'folder') return 1;
//     if (a.kind === 'folder' && b.kind === 'folder') return a.title.localeCompare(b.title);
//     if (a.kind === 'track' && b.kind === 'track') {
//       if (a.album !== b.album) return a.album.localeCompare(b.album);
//       if (a.discNumber !== b.discNumber) return a.discNumber - b.discNumber;
//       return a.trackNumber - b.trackNumber;
//     }
//     return 0;
//   });

//   // Add sortOrder properties to each object
//   let trackSortOrder = 0;
//   data.forEach((item, index) => {
//     item.sortOrder = index;
//     if (item.kind === 'track') {
//       item.trackSortOrder = trackSortOrder;
//       trackSortOrder++;
//     }
//   });

//   return data;
// };

// export const transposeFolderData = (folder, libraryId, serverBaseUrl, accessToken) => {
//   if (folder.ratingKey) {
//     if (folder.type !== 'track') {
//       return null;
//     }
//     return transposeTrackData(folder, libraryId, serverBaseUrl, accessToken);
//   }

//   const folderId = folder.key.split('?parent=')[1];
//   return {
//     kind: 'aaafolder', // "aaa" prefix to force folders to the top
//     libraryId: libraryId,
//     folderId: folderId,
//     title: folder.title,
//     link: '/folders/' + libraryId + '/' + folderId,
//   };
// };

// ======================================================================
// PLAYLISTS
// ======================================================================

export const transposePlaylistArray = (array, libraryId, serverBaseUrl, accessToken) => {
  // console.log(array?.data?.Items);
  const data =
    array?.data?.Items?.map((playlist) => transposePlaylistData(playlist, libraryId, serverBaseUrl, accessToken)) || [];
  return data;
};

export const transposePlaylistDetails = (array, libraryId, serverBaseUrl, accessToken) => {
  // console.log(array?.data);
  const playlist = array?.data;
  const playlistDetails = transposePlaylistData(playlist, libraryId, serverBaseUrl, accessToken);
  return playlistDetails;
};

const transposePlaylistData = (playlist, libraryId, serverBaseUrl, accessToken) => {
  return {
    kind: 'playlist',
    libraryId: libraryId,
    playlistId: playlist.Id,
    title: playlist.Name,
    addedAt: null,
    lastPlayed: null,
    userRating: null,
    isFavourite: playlist.UserData?.IsFavorite || false,
    link: '/playlists/' + libraryId + '/' + playlist.Id,
    totalTracks: playlist.ChildCount,
    duration: playlist.RunTimeTicks / 10000,
    thumb: getThumb(playlist, serverBaseUrl, accessToken, thumbSizeSmall),
    thumbMedium: getThumb(playlist, serverBaseUrl, accessToken, thumbSizeMedium),
  };
};

// ======================================================================
// COLLECTIONS
// ======================================================================

// export const transposeCollectionArray = (array, libraryId, serverBaseUrl, accessToken) => {
//   const allCollections =
//     array?.data?.MediaContainer?.Metadata?.filter(
//       (collection) => collection.subtype === 'artist' || collection.subtype === 'album'
//     ).map((collection) => transposeCollectionData(collection, libraryId, serverBaseUrl, accessToken)) || [];
//   const allArtistCollections = allCollections.filter((collection) => collection.type === 'artist');
//   const allAlbumCollections = allCollections.filter((collection) => collection.type === 'album');
//   return {
//     allArtistCollections,
//     allAlbumCollections,
//   };
// };

// export const transposeCollectionItemArray = (array, libraryId, serverBaseUrl, accessToken, typeKey) => {
//   const data =
//     array?.data?.MediaContainer?.Metadata?.map((item) =>
//       lookups[`transpose${typeKey}Data`](item, libraryId, serverBaseUrl, accessToken)
//     ) || [];
//   return data;
// };

// const transposeCollectionData = (collection, libraryId, serverBaseUrl, accessToken) => {
//   const collectionThumb = collection.thumb ? collection.thumb : collection.composite ? collection.composite : null;
//   return {
//     kind: 'collection',
//     libraryId: libraryId,
//     collectionId: collection.ratingKey,
//     title: collection.title,
//     addedAt: collection.addedAt,
//     userRating: collection.userRating,
//     type: collection.subtype,
//     link:
//       (collection.subtype === 'artist' ? '/artist-collections/' : '/album-collections/') +
//       libraryId +
//       '/' +
//       collection.ratingKey,
//     thumb: getThumb(serverBaseUrl, collectionThumb, thumbSizeSmall, accessToken),
//     thumbMedium: getThumb(serverBaseUrl, collectionThumb, thumbSizeMedium, accessToken),
//   };
// };

// ======================================================================
// TAGS
// ======================================================================

// const tagItemOptions = {
//   AlbumGenreItems: { primaryKey: 'Album' },
//   AlbumMoodItems: { primaryKey: 'Album' },
//   AlbumStyleItems: { primaryKey: 'Album' },
//   ArtistGenreItems: { primaryKey: 'Artist' },
//   ArtistMoodItems: { primaryKey: 'Artist' },
//   ArtistStyleItems: { primaryKey: 'Artist' },
// };

export const transposeTagArray = (array, libraryId, primaryKey, secondaryKey) => {
  const data = array?.map((entry) => lookups[`transpose${secondaryKey}Data`](primaryKey, entry, libraryId)) || [];
  return data;
};

// export const transposeTagItemArray = (array, libraryId, serverBaseUrl, accessToken, typeKey) => {
//   const { primaryKey } = tagItemOptions[typeKey];
//   const data =
//     array?.data?.MediaContainer?.Metadata?.map((entry) =>
//       lookups[`transpose${primaryKey}Data`](entry, libraryId, serverBaseUrl, accessToken)
//     ) || [];
//   return data;
// };

const transposeGenreData = (primaryKey, genre, libraryId) => {
  const genreId = safeEncodeURIComponent(genre);
  return {
    kind: 'genre',
    libraryId: libraryId,
    genreId: genreId,
    title: genre.replace(/\//g, ' & '),
    link: '/' + primaryKey + '-genres/' + libraryId + '/' + genreId,
  };
};

const transposeTagData = (primaryKey, tag, libraryId) => {
  const tagId = safeEncodeURIComponent(tag);
  return {
    kind: 'tag',
    libraryId: libraryId,
    tagId: tagId,
    title: tag.replace(/\//g, ' & '),
    link: '/' + primaryKey + '-tags/' + libraryId + '/' + tagId,
  };
};

// ======================================================================
// TRACKS
// ======================================================================

export const transposeTrackArray = (array, libraryId, serverBaseUrl, accessToken) => {
  // console.log(array?.data?.Items);
  const data =
    array?.data?.Items?.map((track) => transposeTrackData(track, libraryId, serverBaseUrl, accessToken)) || [];
  return data;
};

const transposeTrackData = (track, libraryId, serverBaseUrl, accessToken) => {
  const artistName = track.AlbumArtist;
  const artistId =
    track.AlbumArtists?.filter((artist) => artist.Name === artistName)[0]?.Id || track.AlbumArtists?.[0]?.Id || null;
  const bitrate = track?.MediaStreams?.find((track) => track.Type.toLowerCase() === 'audio')?.BitRate;

  return {
    kind: 'track',
    libraryId: libraryId,
    trackId: track.Id,
    trackKey: null, // I think in Plex this is used for playback logs
    title: track.Name,
    // addedAt: track.addedAt,
    artist: artistName,
    artistLink: '/artists/' + libraryId + '/' + artistId,
    album: track.Album,
    albumId: track.AlbumId,
    albumLink: '/albums/' + libraryId + '/' + track.AlbumId,
    trackNumber: track.IndexNumber,
    discNumber: track.ParentIndexNumber,
    codec: track?.MediaStreams?.find((track) => track.Type.toLowerCase() === 'audio')?.Codec,
    bitrate: bitrate ? Math.round(bitrate / 1000) : null,
    duration: track.RunTimeTicks / 10000,
    userRating: null,
    isFavourite: track.UserData?.IsFavorite || false,
    releaseDate: track.PremiereDate || null,
    thumb: getThumb(track, serverBaseUrl, accessToken, thumbSizeSmall),
    thumbMedium: getThumb(track, serverBaseUrl, accessToken, thumbSizeMedium),
    src: `${serverBaseUrl}/Audio/${track.Id}/stream?static=true&api_key=${accessToken}`,
  };
};

// const streamUrl = `${serverBaseUrl}/Audio/${trackId}/stream?static=true&api_key=${accessToken}`;

// http://192.168.1.201:8096/Audio/5bdcac4a524f7e26db698c28a08831d2/stream?static=true&api_key=d4ebbfe4fc4a4732a3a45a30ae399ede

// ======================================================================
// SEARCH RESULTS
// ======================================================================

const typeOrder = {
  artist: 1,
  album: 2,
  playlist: 3,
  // 'artist collection': 4,
  // 'album collection': 5,
  track: 4,
};

export const transposeSearchResultsArray = (array, libraryId, serverBaseUrl, accessToken) => {
  const data =
    array?.data?.Items?.map((result) => transposeSearchResultData(result, libraryId, serverBaseUrl, accessToken))
      .filter((result) => result !== null)
      .sort((a, b) => {
        if (a.type === b.type) {
          return a.title.localeCompare(b.title);
        }
        return typeOrder[a.type] - typeOrder[b.type];
      }) || [];
  return data;
};

const transposeSearchResultData = (result, libraryId, serverBaseUrl, accessToken) => {
  if (result?.Type) {
    if (result.Type === 'MusicArtist') {
      return {
        // score: null,
        artistId: result.Id,
        type: 'artist',
        icon: 'PeopleIcon',
        title: result.Name,
        link: '/artists/' + libraryId + '/' + result.Id,
        thumb: getThumb(result, serverBaseUrl, accessToken, thumbSizeSmall),
      };
    } else if (result.Type === 'MusicAlbum') {
      return {
        // score: null,
        albumId: result.Id,
        type: 'album',
        icon: 'PlayCircleIcon',
        title: result.Name,
        link: '/albums/' + libraryId + '/' + result.Id,
        thumb: getThumb(result, serverBaseUrl, accessToken, thumbSizeSmall),
      };
    } else if (result.Type === 'Playlist') {
      return {
        // score: null,
        playlistId: result.Id,
        type: 'playlist',
        icon: 'PlaylistIcon',
        title: result.Name,
        link: '/playlists/' + libraryId + '/' + result.Id,
        thumb: getThumb(result, serverBaseUrl, accessToken, thumbSizeSmall),
      };
    } else if (result.Type === 'Audio') {
      return {
        // score: null,
        trackId: result.Id,
        type: 'track',
        icon: 'MusicNoteSingleIcon',
        title: result.Name,
        link: '/albums/' + libraryId + '/' + (result.ParentId || result.AlbumId),
        thumb: getThumb(result, serverBaseUrl, accessToken, thumbSizeSmall),
      };
    }
  }

  return null;
};

// ======================================================================
// DYNAMIC LOOKUPS
// ======================================================================

const lookups = {
  // transposeArtistData,
  // transposeAlbumData,
  transposeGenreData,
  // transposeMoodData,
  // transposeStyleData,
  transposeTagData,
};
