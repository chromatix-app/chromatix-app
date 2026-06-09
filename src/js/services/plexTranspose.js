/*
We are transposing the API data to a format that is easier to work with in the app and
consistent between music services, and also doing some additional processing and validation.
*/

// ======================================================================
// IMPORTS
// ======================================================================

// ======================================================================
// OPTIONS
// ======================================================================

const thumbSizeSmall = 360;
const thumbSizeMedium = 680;

// ======================================================================
// HELPERS
// ======================================================================

const getThumb = (thumb, serverBaseUrl, accessToken, size) => {
  const finalThumb = thumb
    ? `${serverBaseUrl}/photo/:/transcode?width=${size}&height=${size}&url=${encodeURIComponent(
        thumb.split('?')[0]
      )}&minSize=1&X-Plex-Token=${accessToken}`
    : null;
  return finalThumb;
};

// ======================================================================
// ALL USERS
// ======================================================================

export const transposeAllUsersArray = (array) => {
  const data = array?.data?.users?.map((user) => transposeAllUserData(user)) || [];
  return data;
};

const transposeAllUserData = (user) => {
  return {
    admin: user.admin,
    displayName: user.title || user.username,
    email: user.email,
    guest: user.guest,
    pinProtected: user.protected,
    restrictionProfile: user.restrictionProfile,
    thumbSm: user.thumb,
    userId: user.id,
    uuid: user.uuid,
  };
};

// ======================================================================
// USER
// ======================================================================

export const transposeUserData = (user) => {
  const data = user.data;
  return {
    displayName: data.title || data.username,
    email: data.email,
    thumbSm: data.thumb,
    userId: data.id,
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

const transposeServerData = (server) => {
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

const transposeLibraryData = (library) => {
  return {
    libraryId: library.key,
    title: library.title,
  };
};

// ======================================================================
// ARTISTS
// ======================================================================

export const transposeArtistArray = (array, libraryId, serverBaseUrl, accessToken) => {
  const data =
    array?.data?.MediaContainer?.Metadata?.map((artist) =>
      transposeArtistData(artist, libraryId, serverBaseUrl, accessToken)
    ) || [];
  return data;
};

export const transposeArtistDetails = (array, libraryId, serverBaseUrl, accessToken) => {
  const artist = array?.data?.MediaContainer?.Metadata[0];
  const artistDetails = transposeArtistData(artist, libraryId, serverBaseUrl, accessToken);
  return artistDetails;
};

export const transposeArtistRelatedArray = (array, libraryId, serverBaseUrl, accessToken) => {
  const data =
    // array?.data?.MediaContainer?.Hub?.filter(
    array?.data?.MediaContainer?.Metadata?.[0]?.Related?.Hub?.filter(
      (hub) => hub.type === 'album' && hub.Metadata && hub.context && hub.context.includes('hub.artist.albums')
    ).map((hub) => ({
      title: hub.title,
      related: hub.Metadata.map((album) => transposeAlbumData(album, libraryId, serverBaseUrl, accessToken)),
    })) || [];
  return data;
};

export const transposeArtistAppearanceAlbumIdsArray = (array, libraryId, serverBaseUrl, accessToken) => {
  const artistAppearanceTracks =
    array?.data?.MediaContainer?.Metadata?.map((track) =>
      transposeTrackData(track, libraryId, serverBaseUrl, accessToken)
    ) || [];
  // get a unique list of album IDs using the albumId key of each track
  const artistAppearanceAlbums = [...new Set(artistAppearanceTracks.map((track) => track.albumId))];
  return artistAppearanceAlbums;
};

const transposeArtistData = (artist, libraryId, serverBaseUrl, accessToken) => {
  return {
    kind: 'artist',
    libraryId: libraryId,
    artistId: artist.ratingKey,
    title: artist.title,
    genre: artist?.Genre?.[0]?.tag,
    country: artist?.Country?.[0]?.tag,
    addedAt: artist.addedAt,
    lastPlayed: artist.lastViewedAt,
    userRating: artist.userRating,
    isFavourite: false,
    link: '/libraries/' + libraryId + '/artists/' + artist.ratingKey,
    thumbSm: getThumb(artist.thumb, serverBaseUrl, accessToken, thumbSizeSmall),
    thumbMd: getThumb(artist.thumb, serverBaseUrl, accessToken, thumbSizeMedium),
  };
};

// ======================================================================
// ALBUMS
// ======================================================================

export const transposeAlbumArray = (array, libraryId, serverBaseUrl, accessToken) => {
  const data =
    array?.data?.MediaContainer?.Metadata?.map((album) =>
      transposeAlbumData(album, libraryId, serverBaseUrl, accessToken)
    ) || [];
  return data;
};

export const transposeAlbumDetails = (array, libraryId, serverBaseUrl, accessToken) => {
  const album = array?.data?.MediaContainer?.Metadata[0];
  const albumDetails = transposeAlbumData(album, libraryId, serverBaseUrl, accessToken);
  return albumDetails;
};

const transposeAlbumData = (album, libraryId, serverBaseUrl, accessToken) => {
  return {
    kind: 'album',
    libraryId: libraryId,
    albumId: album.ratingKey,
    title: album.title,
    artist: album.parentTitle,
    artistId: album.parentRatingKey,
    artistLink: '/libraries/' + libraryId + '/artists/' + album.parentRatingKey,
    genre: album?.Genre?.[0]?.tag,
    addedAt: album.addedAt,
    lastPlayed: album.lastViewedAt,
    userRating: album.userRating,
    isFavourite: false,
    releaseDate: album.originallyAvailableAt,
    link: '/libraries/' + libraryId + '/albums/' + album.ratingKey,
    thumbSm: getThumb(album.thumb, serverBaseUrl, accessToken, thumbSizeSmall),
    thumbMd: getThumb(album.thumb, serverBaseUrl, accessToken, thumbSizeMedium),
  };
};

// ======================================================================
// FOLDERS
// ======================================================================

export const transposeFolderArray = (array, libraryId, serverBaseUrl, accessToken) => {
  const data =
    array?.data?.MediaContainer?.Metadata?.map((item) =>
      transposeFolderData(item, libraryId, serverBaseUrl, accessToken)
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

const transposeFolderData = (folder, libraryId, serverBaseUrl, accessToken) => {
  if (folder.ratingKey) {
    if (folder.type !== 'track') {
      return null;
    }
    return transposeTrackData(folder, libraryId, serverBaseUrl, accessToken);
  }

  const folderId = folder.key.split('?parent=')[1];
  return {
    kind: 'aaafolder', // "aaa" prefix to force folders to the top
    libraryId: libraryId,
    folderId: folderId,
    title: folder.title,
    link: '/libraries/' + libraryId + '/folders/' + folderId,
  };
};

// ======================================================================
// PLAYLISTS
// ======================================================================

export const transposePlaylistArray = (array, libraryId, serverBaseUrl, accessToken, timeStamp, allPlaylistEdits) => {
  const data =
    array?.data?.MediaContainer?.Metadata?.map((playlist) =>
      transposePlaylistData(
        playlist,
        libraryId,
        serverBaseUrl,
        accessToken,
        timeStamp + (allPlaylistEdits[playlist.ratingKey] || 0)
      )
    ) || [];
  return data;
};

export const transposePlaylistDetails = (array, libraryId, serverBaseUrl, accessToken, timeStamp) => {
  const playlist = array?.data?.MediaContainer?.Metadata[0];
  const playlistDetails = transposePlaylistData(playlist, libraryId, serverBaseUrl, accessToken, timeStamp);
  return playlistDetails;
};

const transposePlaylistData = (playlist, libraryId, serverBaseUrl, accessToken, timeStamp) => {
  const hasThumb = Boolean(playlist.thumb);
  let playlistComposite = null;

  // Get the playlist composite image
  if (!hasThumb && playlist.composite) {
    // Remove trailing slashes and replace last URL segment with a fixed timestamp.
    // This is because otherwise Plex will regenerate the thumb every time,
    // which is noticeable in app.
    playlistComposite = playlist.composite.replace(/\/+$/, '');
    const lastSlashIndex = playlistComposite.lastIndexOf('/');
    if (lastSlashIndex !== -1) {
      playlistComposite = playlistComposite.substring(0, lastSlashIndex + 1) + timeStamp;
    }
  }

  const playlistThumb = hasThumb ? playlist.thumb : playlistComposite;
  return {
    kind: 'playlist',
    libraryId: libraryId,
    playlistId: playlist.ratingKey,
    title: playlist.title,
    addedAt: playlist.addedAt,
    lastPlayed: playlist.lastViewedAt,
    userRating: playlist.userRating,
    isFavourite: false,
    link: '/libraries/' + libraryId + '/playlists/' + playlist.ratingKey,
    totalTracks: playlist.leafCount,
    duration: playlist.duration,
    thumbSm: getThumb(playlistThumb, serverBaseUrl, accessToken, thumbSizeSmall),
    thumbMd: getThumb(playlistThumb, serverBaseUrl, accessToken, thumbSizeMedium),
  };
};

// ======================================================================
// COLLECTIONS
// ======================================================================

export const transposeCollectionArray = (array, libraryId, serverBaseUrl, accessToken) => {
  const allCollections =
    array?.data?.MediaContainer?.Metadata?.filter(
      (collection) => collection.subtype === 'artist' || collection.subtype === 'album'
    ).map((collection) => transposeCollectionData(collection, libraryId, serverBaseUrl, accessToken)) || [];
  const allArtistCollections = allCollections.filter((collection) => collection.type === 'artist');
  const allAlbumCollections = allCollections.filter((collection) => collection.type === 'album');
  return {
    allArtistCollections,
    allAlbumCollections,
  };
};

export const transposeCollectionItemArray = (array, libraryId, serverBaseUrl, accessToken, typeKey) => {
  const data =
    array?.data?.MediaContainer?.Metadata?.map((item) =>
      lookups[`transpose${typeKey}Data`](item, libraryId, serverBaseUrl, accessToken)
    ) || [];
  return data;
};

const transposeCollectionData = (collection, libraryId, serverBaseUrl, accessToken) => {
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
      '/libraries/' +
      libraryId +
      (collection.subtype === 'artist' ? '/artist-collections/' : '/album-collections/') +
      collection.ratingKey,
    thumbSm: getThumb(collectionThumb, serverBaseUrl, accessToken, thumbSizeSmall),
    thumbMd: getThumb(collectionThumb, serverBaseUrl, accessToken, thumbSizeMedium),
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

export const transposeTagItemArray = (array, libraryId, serverBaseUrl, accessToken, typeKey) => {
  const { primaryKey } = tagItemOptions[typeKey];
  const data =
    array?.data?.MediaContainer?.Metadata?.map((entry) =>
      lookups[`transpose${primaryKey}Data`](entry, libraryId, serverBaseUrl, accessToken)
    ) || [];
  return data;
};

const transposeGenreData = (type, genre, libraryId) => {
  return {
    kind: 'genre',
    libraryId: libraryId,
    genreId: genre.key,
    title: genre.title.replace(/\//g, ' & '),
    link: '/libraries/' + libraryId + '/' + type + '-genres/' + genre.key,
  };
};

const transposeMoodData = (type, mood, libraryId) => {
  return {
    kind: 'mood',
    libraryId: libraryId,
    moodId: mood.key,
    title: mood.title.replace(/\//g, ' & '),
    link: '/libraries/' + libraryId + '/' + type + '-moods/' + mood.key,
  };
};

const transposeStyleData = (type, style, libraryId) => {
  return {
    kind: 'style',
    libraryId: libraryId,
    styleId: style.key,
    title: style.title.replace(/\//g, ' & '),
    link: '/libraries/' + libraryId + '/' + type + '-styles/' + style.key,
  };
};

// ======================================================================
// TRACKS
// ======================================================================

export const transposeTrackArray = (array, libraryId, serverBaseUrl, accessToken) => {
  // console.log(array?.data?.MediaContainer?.Metadata);
  const data =
    array?.data?.MediaContainer?.Metadata?.map((track) =>
      transposeTrackData(track, libraryId, serverBaseUrl, accessToken)
    ) || [];
  return data;
};

const transposeTrackData = (track, libraryId, serverBaseUrl, accessToken) => {
  const isLikelyAppearance = track.originalTitle && track.originalTitle !== track.grandparentTitle;

  const artistTitle = isLikelyAppearance ? track.originalTitle : track.grandparentTitle;
  const artistLink = isLikelyAppearance ? null : '/libraries/' + libraryId + '/artists/' + track.grandparentRatingKey;

  const originalSrc = `${serverBaseUrl}${track.Media[0].Part[0].key}?X-Plex-Token=${accessToken}`;

  return {
    kind: 'track',
    libraryId: libraryId,
    trackId: track.ratingKey,
    trackKey: track.key,
    playlistItemID: track.playlistItemID,
    title: track.title,
    // addedAt: track.addedAt,
    artist: artistTitle,
    artistLink: artistLink,
    album: track.parentTitle,
    albumId: track.parentRatingKey,
    albumLink: '/libraries/' + libraryId + '/albums/' + track.parentRatingKey,
    trackNumber: track.index,
    discNumber: track.parentIndex,
    codec: track.Media[0].audioCodec,
    bitrate: track.Media[0].bitrate,
    duration: track.Media[0].duration,
    userRating: track.userRating,
    releaseDate: track.parentYear ? track.parentYear + '-01-01' : null,
    thumbSm: getThumb(track.thumb, serverBaseUrl, accessToken, thumbSizeSmall),
    thumbMd: getThumb(track.thumb, serverBaseUrl, accessToken, thumbSizeMedium),
    src: originalSrc,
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

export const transposeSearchResultsArray = (array, libraryId, serverBaseUrl, accessToken) => {
  const data =
    array?.data?.MediaContainer?.Hub?.flatMap((result) => result.Metadata)
      ?.map((result) => transposeSearchResultData(result, libraryId, serverBaseUrl, accessToken))
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

const transposeSearchResultData = (result, libraryId, serverBaseUrl, accessToken) => {
  if (result?.type) {
    if (result.type === 'artist') {
      return {
        score: result.score,
        artistId: result.ratingKey,
        type: 'artist',
        icon: 'PeopleIcon',
        title: result.title,
        link: '/libraries/' + libraryId + '/artists/' + result.ratingKey,
        thumbSm: getThumb(result.thumb, serverBaseUrl, accessToken, thumbSizeSmall),
      };
    } else if (result.type === 'album') {
      return {
        score: result.score,
        albumId: result.ratingKey,
        type: 'album',
        icon: 'PlayCircleIcon',
        title: result.title,
        link: '/libraries/' + libraryId + '/albums/' + result.ratingKey,
        thumbSm: getThumb(result.thumb, serverBaseUrl, accessToken, thumbSizeSmall),
      };
    } else if (result.type === 'playlist') {
      const playlistThumb = result.thumb ? result.thumb : result.composite ? result.composite : null;
      return {
        score: result.score,
        playlistId: result.ratingKey,
        type: 'playlist',
        icon: 'PlaylistIcon',
        title: result.title,
        link: '/libraries/' + libraryId + '/playlists/' + result.ratingKey,
        thumbSm: getThumb(playlistThumb, serverBaseUrl, accessToken, thumbSizeSmall),
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
          '/libraries/' +
          libraryId +
          (result.subtype === 'artist' ? '/artist-collections/' : '/album-collections/') +
          result.ratingKey,
        thumbSm: getThumb(collectionThumb, serverBaseUrl, accessToken, thumbSizeSmall),
      };
    } else if (result.type === 'track') {
      return {
        score: result.score,
        trackId: result.ratingKey,
        type: 'track',
        icon: 'MusicNoteSingleIcon',
        title: result.title,
        link: '/libraries/' + libraryId + '/albums/' + result.parentRatingKey,
        thumbSm: getThumb(result.thumb, serverBaseUrl, accessToken, thumbSizeSmall),
      };
    }
  }

  return null;
};

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
