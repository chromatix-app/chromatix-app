/*
We are transposing the API data to a format that is easier to work with in the app and
consistent between music services, and also doing some additional processing and validation.
*/

// ======================================================================
// OPTIONS
// ======================================================================

const thumbSizeSmall = 360;
const thumbSizeMedium = 600;

// ======================================================================
// HELPERS
// ======================================================================

const getUserImage = (primaryImageTag, baseUrl, accessToken, userId) => {
  if (!primaryImageTag) {
    return null;
  }
  return `${baseUrl}/Users/${userId}/Images/Primary?api_key=${accessToken}&tag=${primaryImageTag}`;
};

const getThumb = (thumbImageTag, itemId, baseUrl, accessToken, size) => {
  if (!thumbImageTag) {
    return null;
  }
  return `${baseUrl}/Items/${itemId}/Images/Primary?api_key=${accessToken}&tag=${thumbImageTag}&width=${size}&height=${size}`;
};

// ======================================================================
// USER
// ======================================================================

export const transposeUserData = (data, baseUrl, accessToken, userId) => {
  // console.log(user?.data);
  const user = data?.data;
  return {
    userId: user.Id,
    email: null,
    thumb: getUserImage(user.PrimaryImageTag, baseUrl, accessToken, userId),
    username: user.Name,
    serverBaseUrl: baseUrl,
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

export const transposeLibraryData = (library) => {
  return {
    libraryId: library.Id,
    title: library.Name,
  };
};

// ======================================================================
// ARTISTS
// ======================================================================

export const transposeArtistArray = (array, libraryId, baseUrl, accessToken) => {
  // console.log(array?.data?.Items);
  const data = array?.data?.Items?.map((artist) => transposeArtistData(artist, libraryId, baseUrl, accessToken)) || [];
  return data;
};

export const transposeArtistDetails = (array, libraryId, baseUrl, accessToken) => {
  // console.log(array?.data);
  const artist = array?.data;
  const artistDetails = transposeArtistData(artist, libraryId, baseUrl, accessToken);
  return artistDetails;
};

// export const transposeArtistRelatedArray = (array, libraryId, baseUrl, accessToken) => {
//   const data =
//     // array?.data?.MediaContainer?.Hub?.filter(
//     array?.data?.MediaContainer?.Metadata?.[0]?.Related?.Hub?.filter(
//       (hub) => hub.type === 'album' && hub.Metadata && hub.context && hub.context.includes('hub.artist.albums')
//     ).map((hub) => ({
//       title: hub.title,
//       related: hub.Metadata.map((album) => transposeAlbumData(album, libraryId, baseUrl, accessToken)),
//     })) || [];
//   return data;
// };

// export const transposeArtistAppearanceAlbumIdsArray = (array, libraryId, baseUrl, accessToken) => {
//   const artistAppearanceTracks =
//     array?.data?.MediaContainer?.Metadata?.map((track) => transposeTrackData(track, libraryId, baseUrl, accessToken)) ||
//     [];
//   // get a unique list of album IDs using the albumId key of each track
//   const artistAppearanceAlbums = [...new Set(artistAppearanceTracks.map((track) => track.albumId))];
//   return artistAppearanceAlbums;
// };

export const transposeArtistData = (artist, libraryId, baseUrl, accessToken) => {
  return {
    kind: 'artist',
    libraryId: libraryId,
    artistId: artist.Id,
    title: artist.Name,
    genre: artist?.Genres?.[0],
    country: null,
    addedAt: null,
    lastPlayed: null,
    userRating: null,
    isFavourite: artist.UserData?.IsFavorite || false,
    link: '/artists/' + libraryId + '/' + artist.Id,
    thumb: getThumb(artist.ImageTags?.Primary, artist.Id, baseUrl, accessToken, thumbSizeSmall),
    thumbMedium: getThumb(artist.ImageTags?.Primary, artist.Id, baseUrl, accessToken, thumbSizeMedium),
  };
};

// ======================================================================
// ALBUMS
// ======================================================================

export const transposeAlbumArray = (array, libraryId, baseUrl, accessToken) => {
  // console.log(array?.data?.Items);
  const data = array?.data?.Items?.map((album) => transposeAlbumData(album, libraryId, baseUrl, accessToken)) || [];
  return data;
};

export const transposeAlbumDetails = (array, libraryId, baseUrl, accessToken) => {
  // console.log(array?.data);
  const album = array?.data;
  const albumDetails = transposeAlbumData(album, libraryId, baseUrl, accessToken);
  return albumDetails;
};

export const transposeAlbumData = (album, libraryId, baseUrl, accessToken) => {
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
    thumb: getThumb(album.ImageTags?.Primary, album.Id, baseUrl, accessToken, thumbSizeSmall),
    thumbMedium: getThumb(album.ImageTags?.Primary, album.Id, baseUrl, accessToken, thumbSizeMedium),
  };
};

// ======================================================================
// FOLDERS
// ======================================================================

// export const transposeFolderArray = (array, libraryId, baseUrl, accessToken) => {
//   const data =
//     array?.data?.MediaContainer?.Metadata?.map((item) =>
//       transposeFolderData(item, libraryId, baseUrl, accessToken)
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

// export const transposeFolderData = (folder, libraryId, baseUrl, accessToken) => {
//   if (folder.ratingKey) {
//     if (folder.type !== 'track') {
//       return null;
//     }
//     return transposeTrackData(folder, libraryId, baseUrl, accessToken);
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

export const transposePlaylistArray = (array, libraryId, baseUrl, accessToken) => {
  // console.log(array?.data?.Items);
  const data =
    array?.data?.Items?.map((playlist) => transposePlaylistData(playlist, libraryId, baseUrl, accessToken)) || [];
  return data;
};

export const transposePlaylistDetails = (array, libraryId, baseUrl, accessToken) => {
  // console.log(array?.data);
  const playlist = array?.data;
  const playlistDetails = transposePlaylistData(playlist, libraryId, baseUrl, accessToken);
  return playlistDetails;
};

export const transposePlaylistData = (playlist, libraryId, baseUrl, accessToken) => {
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
    thumb: getThumb(playlist.ImageTags?.Primary, playlist.Id, baseUrl, accessToken, thumbSizeSmall),
    thumbMedium: getThumb(playlist.ImageTags?.Primary, playlist.Id, baseUrl, accessToken, thumbSizeMedium),
  };
};

// ======================================================================
// COLLECTIONS
// ======================================================================

// export const transposeCollectionArray = (array, libraryId, baseUrl, accessToken) => {
//   const allCollections =
//     array?.data?.MediaContainer?.Metadata?.filter(
//       (collection) => collection.subtype === 'artist' || collection.subtype === 'album'
//     ).map((collection) => transposeCollectionData(collection, libraryId, baseUrl, accessToken)) || [];
//   const allArtistCollections = allCollections.filter((collection) => collection.type === 'artist');
//   const allAlbumCollections = allCollections.filter((collection) => collection.type === 'album');
//   return {
//     allArtistCollections,
//     allAlbumCollections,
//   };
// };

// export const transposeCollectionItemArray = (array, libraryId, baseUrl, accessToken, typeKey) => {
//   const data =
//     array?.data?.MediaContainer?.Metadata?.map((item) =>
//       lookups[`transpose${typeKey}Data`](item, libraryId, baseUrl, accessToken)
//     ) || [];
//   return data;
// };

// export const transposeCollectionData = (collection, libraryId, baseUrl, accessToken) => {
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
//     thumb: getThumb(baseUrl, collectionThumb, thumbSizeSmall, accessToken),
//     thumbMedium: getThumb(baseUrl, collectionThumb, thumbSizeMedium, accessToken),
//   };
// };

// ======================================================================
// TAGS
// ======================================================================

// const tagOptions = {
//   AlbumGenres: { primaryKey: 'album', secondaryKey: 'Genre' },
//   AlbumMoods: { primaryKey: 'album', secondaryKey: 'Mood' },
//   AlbumStyles: { primaryKey: 'album', secondaryKey: 'Style' },
//   ArtistGenres: { primaryKey: 'artist', secondaryKey: 'Genre' },
//   ArtistMoods: { primaryKey: 'artist', secondaryKey: 'Mood' },
//   ArtistStyles: { primaryKey: 'artist', secondaryKey: 'Style' },
// };

// const tagItemOptions = {
//   AlbumGenreItems: { primaryKey: 'Album' },
//   AlbumMoodItems: { primaryKey: 'Album' },
//   AlbumStyleItems: { primaryKey: 'Album' },
//   ArtistGenreItems: { primaryKey: 'Artist' },
//   ArtistMoodItems: { primaryKey: 'Artist' },
//   ArtistStyleItems: { primaryKey: 'Artist' },
// };

// export const transposeTagArray = (array, libraryId, typeKey) => {
//   const { primaryKey, secondaryKey } = tagOptions[typeKey];
//   const data =
//     array?.data?.MediaContainer?.Directory?.map((entry) =>
//       lookups[`transpose${secondaryKey}Data`](primaryKey, entry, libraryId)
//     ) || [];
//   return data;
// };

// export const transposeTagItemArray = (array, libraryId, baseUrl, accessToken, typeKey) => {
//   const { primaryKey } = tagItemOptions[typeKey];
//   const data =
//     array?.data?.MediaContainer?.Metadata?.map((entry) =>
//       lookups[`transpose${primaryKey}Data`](entry, libraryId, baseUrl, accessToken)
//     ) || [];
//   return data;
// };

// export const transposeGenreData = (type, genre, libraryId) => {
//   return {
//     kind: 'genre',
//     libraryId: libraryId,
//     genreId: genre.key,
//     title: genre.title.replace(/\//g, ' & '),
//     link: '/' + type + '-genres/' + libraryId + '/' + genre.key,
//   };
// };

// export const transposeMoodData = (type, mood, libraryId) => {
//   return {
//     kind: 'mood',
//     libraryId: libraryId,
//     moodId: mood.key,
//     title: mood.title.replace(/\//g, ' & '),
//     link: '/' + type + '-moods/' + libraryId + '/' + mood.key,
//   };
// };

// export const transposeStyleData = (type, style, libraryId) => {
//   return {
//     kind: 'style',
//     libraryId: libraryId,
//     styleId: style.key,
//     title: style.title.replace(/\//g, ' & '),
//     link: '/' + type + '-styles/' + libraryId + '/' + style.key,
//   };
// };

// ======================================================================
// TRACKS
// ======================================================================

export const transposeTrackArray = (array, libraryId, baseUrl, accessToken) => {
  // console.log(array?.data?.Items);
  const data = array?.data?.Items?.map((track) => transposeTrackData(track, libraryId, baseUrl, accessToken)) || [];
  return data;
};

export const transposeTrackData = (track, libraryId, baseUrl, accessToken) => {
  const artistName = track.AlbumArtist;
  const artistId =
    track.AlbumArtists?.filter((artist) => artist.Name === artistName)[0]?.Id || track.AlbumArtists?.[0]?.Id || null;

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
    codec: null,
    bitrate: null,
    duration: track.RunTimeTicks / 10000,
    userRating: null,
    // isFavourite: playlist.UserData?.IsFavorite || false,
    releaseDate: track.PremiereDate || null,
    thumb: getThumb(track.ImageTags?.Primary, track.Id, baseUrl, accessToken, thumbSizeSmall),
    thumbMedium: getThumb(track.ImageTags?.Primary, track.Id, baseUrl, accessToken, thumbSizeMedium),
    src: `${baseUrl}/Audio/${track.Id}/stream?static=true&api_key=${accessToken}`,
  };
};

// const streamUrl = `${baseUrl}/Audio/${trackId}/stream?static=true&api_key=${accessToken}`;

// http://192.168.1.201:8096/Audio/5bdcac4a524f7e26db698c28a08831d2/stream?static=true&api_key=d4ebbfe4fc4a4732a3a45a30ae399ede

// ======================================================================
// SEARCH RESULTS
// ======================================================================

// const typeOrder = {
//   artist: 1,
//   album: 2,
//   playlist: 3,
//   'artist collection': 4,
//   'album collection': 5,
//   track: 6,
// };

// export const transposeSearchResultsArray = (array, libraryId, baseUrl, accessToken) => {
//   const data =
//     array?.data?.MediaContainer?.Hub?.flatMap((result) => result.Metadata)
//       ?.map((result) => transposeSearchResultData(result, libraryId, baseUrl, accessToken))
//       .filter((result) => result !== null)
//       .sort((a, b) => {
//         if (b.score === a.score) {
//           if (a.type === b.type) {
//             return a.title.localeCompare(b.title);
//           }
//           return typeOrder[a.type] - typeOrder[b.type];
//         }
//         return b.score - a.score;
//       }) || [];
//   return data;
// };

// export const transposeSearchResultData = (result, libraryId, baseUrl, accessToken) => {
//   if (result?.type) {
//     if (result.type === 'artist') {
//       return {
//         score: result.score,
//         artistId: result.ratingKey,
//         type: 'artist',
//         icon: 'PeopleIcon',
//         title: result.title,
//         link: '/artists/' + libraryId + '/' + result.ratingKey,
//         thumb: getThumb(baseUrl, result.thumb, thumbSizeSmall, accessToken),
//       };
//     } else if (result.type === 'album') {
//       return {
//         score: result.score,
//         albumId: result.ratingKey,
//         type: 'album',
//         icon: 'PlayCircleIcon',
//         title: result.title,
//         link: '/albums/' + libraryId + '/' + result.ratingKey,

//         thumb: getThumb(baseUrl, result.thumb, thumbSizeSmall, accessToken),
//       };
//     } else if (result.type === 'playlist') {
//       const playlistThumb = result.thumb ? result.thumb : result.composite ? result.composite : null;
//       return {
//         score: result.score,
//         playlistId: result.ratingKey,
//         type: 'playlist',
//         icon: 'PlaylistIcon',
//         title: result.title,
//         link: '/playlists/' + libraryId + '/' + result.ratingKey,
//         thumb: getThumb(baseUrl, playlistThumb, thumbSizeSmall, accessToken),
//       };
//     } else if (result.type === 'collection') {
//       const collectionThumb = result.thumb ? result.thumb : result.composite ? result.composite : null;
//       return {
//         score: result.score,
//         collectionId: result.ratingKey,
//         type: result.subtype + ' collection',
//         icon: result.subtype === 'artist' ? 'ArtistCollectionsIcon' : 'AlbumCollectionsIcon',
//         title: result.title,
//         link:
//           (result.subtype === 'artist' ? '/artist-collections/' : '/album-collections/') +
//           libraryId +
//           '/' +
//           result.ratingKey,
//         thumb: getThumb(baseUrl, collectionThumb, thumbSizeSmall, accessToken),
//       };
//     } else if (result.type === 'track') {
//       return {
//         score: result.score,
//         trackId: result.ratingKey,
//         type: 'track',
//         icon: 'MusicNoteSingleIcon',
//         title: result.title,
//         link: '/albums/' + libraryId + '/' + result.parentRatingKey,

//         thumb: getThumb(baseUrl, result.thumb, thumbSizeSmall, accessToken),
//       };
//     }
//   }

//   return null;
// };

// ======================================================================
// DYNAMIC LOOKUPS
// ======================================================================

// const lookups = {
//   transposeArtistData,
//   transposeAlbumData,
//   transposeGenreData,
//   transposeMoodData,
//   transposeStyleData,
// };
