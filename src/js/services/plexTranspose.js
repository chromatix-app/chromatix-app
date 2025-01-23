// ======================================================================
// OPTIONS
// ======================================================================

const isProduction = process.env.REACT_APP_ENV === 'production';

const mockData = isProduction ? false : false;

const thumbSizeSmall = 400;
const thumbSizeMedium = 600;
const thumbPlaceholder = '/images/artwork-placeholder.png';

// ======================================================================
// TRANSPOSE PLEX DATA
// ======================================================================

/*
We are transposing the Plex data to a format that is easier to work with in the app,
and doing some additional processing and validation.
*/

export const transposeArtistData = (artist, libraryId, plexBaseUrl, accessToken) => {
  return {
    libraryId: libraryId,
    artistId: artist.ratingKey,
    title: artist.title,
    addedAt: artist.addedAt,
    lastPlayed: artist.lastViewedAt,
    country: artist?.Country?.[0]?.tag,
    genre: artist?.Genre?.[0]?.tag,
    userRating: artist.userRating,
    link: '/artists/' + libraryId + '/' + artist.ratingKey,
    thumb: artist.thumb
      ? mockData
        ? artist.thumb
        : `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeSmall}&height=${thumbSizeSmall}&url=${encodeURIComponent(
            artist.thumb
          )}&X-Plex-Token=${accessToken}`
      : thumbPlaceholder,
    thumbMedium: artist.thumb
      ? mockData
        ? artist.thumb
        : `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeMedium}&height=${thumbSizeMedium}&url=${encodeURIComponent(
            artist.thumb
          )}&X-Plex-Token=${accessToken}`
      : thumbPlaceholder,
  };
};

export const transposeAlbumData = (album, libraryId, plexBaseUrl, accessToken) => {
  return {
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
    thumb: album.thumb
      ? mockData
        ? album.thumb
        : `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeSmall}&height=${thumbSizeSmall}&url=${encodeURIComponent(
            album.thumb
          )}&X-Plex-Token=${accessToken}`
      : thumbPlaceholder,
    thumbMedium: album.thumb
      ? mockData
        ? album.thumb
        : `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeMedium}&height=${thumbSizeMedium}&url=${encodeURIComponent(
            album.thumb
          )}&X-Plex-Token=${accessToken}`
      : thumbPlaceholder,
  };
};

export const transposeFolderData = (folder, index, libraryId, plexBaseUrl, accessToken) => {
  if (folder.ratingKey) {
    if (folder.type !== 'track') {
      return null;
    }
    return transposeTrackData(folder, libraryId, plexBaseUrl, accessToken);
  }

  const folderId = folder.key.split('?parent=')[1];
  return {
    libraryId: libraryId,
    folderId: folderId,
    sortOrder: index,
    title: folder.title,
    link: '/folders/' + libraryId + '/' + folderId,
  };
};

export const transposePlaylistData = (playlist, libraryId, plexBaseUrl, accessToken) => {
  const playlistThumb = playlist.thumb ? playlist.thumb : playlist.composite ? playlist.composite : null;
  return {
    libraryId: libraryId,
    playlistId: playlist.ratingKey,
    title: playlist.title,
    addedAt: playlist.addedAt,
    lastPlayed: playlist.lastViewedAt,
    userRating: playlist.userRating,
    link: '/playlists/' + libraryId + '/' + playlist.ratingKey,
    totalTracks: playlist.leafCount,
    duration: playlist.duration,
    thumb: playlistThumb
      ? mockData
        ? playlistThumb
        : `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeSmall}&height=${thumbSizeSmall}&url=${encodeURIComponent(
            playlistThumb
          )}&X-Plex-Token=${accessToken}`
      : thumbPlaceholder,
    thumbMedium: playlistThumb
      ? mockData
        ? playlistThumb
        : `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeMedium}&height=${thumbSizeMedium}&url=${encodeURIComponent(
            playlistThumb
          )}&X-Plex-Token=${accessToken}`
      : thumbPlaceholder,
  };
};

export const transposeTrackData = (track, libraryId, plexBaseUrl, accessToken) => {
  const isLikelyCompilation = track.originalTitle && track.originalTitle !== track.grandparentTitle;

  const artistTitle = isLikelyCompilation ? track.originalTitle : track.grandparentTitle;
  const artistLink = isLikelyCompilation ? null : '/artists/' + libraryId + '/' + track.grandparentRatingKey;

  return {
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
    thumb: track.thumb
      ? `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeSmall}&height=${thumbSizeSmall}&url=${encodeURIComponent(
          track.thumb
        )}&X-Plex-Token=${accessToken}`
      : thumbPlaceholder,
    thumbMedium: track.thumb
      ? `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeMedium}&height=${thumbSizeMedium}&url=${encodeURIComponent(
          track.thumb
        )}&X-Plex-Token=${accessToken}`
      : thumbPlaceholder,
    src: `${plexBaseUrl}${track.Media[0].Part[0].key}?X-Plex-Token=${accessToken}`,
  };
};

export const transposeCollectionData = (collection, libraryId, plexBaseUrl, accessToken) => {
  const collectionThumb = collection.thumb ? collection.thumb : collection.composite ? collection.composite : null;
  return {
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
    thumb: collectionThumb
      ? `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeSmall}&height=${thumbSizeSmall}&url=${encodeURIComponent(
          collectionThumb
        )}&X-Plex-Token=${accessToken}`
      : thumbPlaceholder,
    thumbMedium: collectionThumb
      ? `${plexBaseUrl}/photo/:/transcode?width=${thumbSizeMedium}&height=${thumbSizeMedium}&url=${encodeURIComponent(
          collectionThumb
        )}&X-Plex-Token=${accessToken}`
      : thumbPlaceholder,
  };
};

export const transposeGenreData = (type, genre, libraryId) => {
  return {
    libraryId: libraryId,
    genreId: genre.key,
    title: genre.title.replace(/\//g, ' & '),
    link: '/' + type + '-genres/' + libraryId + '/' + genre.key,
  };
};

export const transposeStyleData = (type, style, libraryId) => {
  return {
    libraryId: libraryId,
    styleId: style.key,
    title: style.title.replace(/\//g, ' & '),
    link: '/' + type + '-styles/' + libraryId + '/' + style.key,
  };
};

export const transposeMoodData = (type, mood, libraryId) => {
  return {
    libraryId: libraryId,
    moodId: mood.key,
    title: mood.title.replace(/\//g, ' & '),
    link: '/' + type + '-moods/' + libraryId + '/' + mood.key,
  };
};
