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

const getUserImage = (primaryImageTag, serverBaseUrl, accessToken, userId) => {
  if (!primaryImageTag) {
    return null;
  }
  return `${serverBaseUrl}/Users/${userId}/Images/Primary?api_key=${accessToken}&tag=${primaryImageTag}`;
};

const getThumb = (thumbImageTag, itemId, serverBaseUrl, accessToken, size) => {
  if (!thumbImageTag) {
    return null;
  }
  return `${serverBaseUrl}/Items/${itemId}/Images/Primary?api_key=${accessToken}&tag=${thumbImageTag}&width=${size}&height=${size}`;
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

export const transposeLibraryData = (library) => {
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

export const transposeArtistData = (artist, libraryId, serverBaseUrl, accessToken) => {
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
    thumb: getThumb(artist.ImageTags?.Primary, artist.Id, serverBaseUrl, accessToken, thumbSizeSmall),
    thumbMedium: getThumb(artist.ImageTags?.Primary, artist.Id, serverBaseUrl, accessToken, thumbSizeMedium),
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

export const transposeAlbumData = (album, libraryId, serverBaseUrl, accessToken) => {
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
    thumb: getThumb(album.ImageTags?.Primary, album.Id, serverBaseUrl, accessToken, thumbSizeSmall),
    thumbMedium: getThumb(album.ImageTags?.Primary, album.Id, serverBaseUrl, accessToken, thumbSizeMedium),
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

export const transposePlaylistData = (playlist, libraryId, serverBaseUrl, accessToken) => {
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
    thumb: getThumb(playlist.ImageTags?.Primary, playlist.Id, serverBaseUrl, accessToken, thumbSizeSmall),
    thumbMedium: getThumb(playlist.ImageTags?.Primary, playlist.Id, serverBaseUrl, accessToken, thumbSizeMedium),
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

// export const transposeCollectionData = (collection, libraryId, serverBaseUrl, accessToken) => {
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

// export const transposeTagItemArray = (array, libraryId, serverBaseUrl, accessToken, typeKey) => {
//   const { primaryKey } = tagItemOptions[typeKey];
//   const data =
//     array?.data?.MediaContainer?.Metadata?.map((entry) =>
//       lookups[`transpose${primaryKey}Data`](entry, libraryId, serverBaseUrl, accessToken)
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

export const transposeTrackArray = (array, libraryId, serverBaseUrl, accessToken) => {
  // console.log(array?.data?.Items);
  const data =
    array?.data?.Items?.map((track) => transposeTrackData(track, libraryId, serverBaseUrl, accessToken)) || [];
  return data;
};

export const transposeTrackData = (track, libraryId, serverBaseUrl, accessToken) => {
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
    thumb: getThumb(track.ImageTags?.Primary, track.Id, serverBaseUrl, accessToken, thumbSizeSmall),
    thumbMedium: getThumb(track.ImageTags?.Primary, track.Id, serverBaseUrl, accessToken, thumbSizeMedium),
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

export const transposeSearchResultData = (result, libraryId, serverBaseUrl, accessToken) => {
  if (result?.Type) {
    if (result.Type === 'MusicArtist') {
      return {
        // score: null,
        artistId: result.Id,
        type: 'artist',
        icon: 'PeopleIcon',
        title: result.Name,
        link: '/artists/' + libraryId + '/' + result.Id,
        thumb: getThumb(result.ImageTags?.Primary, result.Id, serverBaseUrl, accessToken, thumbSizeSmall),
      };
    } else if (result.Type === 'MusicAlbum') {
      return {
        // score: null,
        albumId: result.Id,
        type: 'album',
        icon: 'PlayCircleIcon',
        title: result.Name,
        link: '/albums/' + libraryId + '/' + result.Id,
        thumb: getThumb(result.ImageTags?.Primary, result.Id, serverBaseUrl, accessToken, thumbSizeSmall),
      };
    } else if (result.Type === 'Playlist') {
      return {
        // score: null,
        playlistId: result.Id,
        type: 'playlist',
        icon: 'PlaylistIcon',
        title: result.Name,
        link: '/playlists/' + libraryId + '/' + result.Id,
        thumb: getThumb(result.ImageTags?.Primary, result.Id, serverBaseUrl, accessToken, thumbSizeSmall),
      };
    } else if (result.Type === 'Audio') {
      return {
        // score: null,
        trackId: result.Id,
        type: 'track',
        icon: 'MusicNoteSingleIcon',
        title: result.Name,
        link: '/albums/' + libraryId + '/' + (result.ParentId || result.AlbumId),
        thumb: getThumb(result.ImageTags?.Primary, result.Id, serverBaseUrl, accessToken, thumbSizeSmall),
      };
    }
  }

  return null;
};

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
