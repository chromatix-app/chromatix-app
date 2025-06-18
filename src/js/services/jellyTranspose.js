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

// ======================================================================
// TAGS
// ======================================================================

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

// ======================================================================
// SEARCH RESULTS
// ======================================================================
