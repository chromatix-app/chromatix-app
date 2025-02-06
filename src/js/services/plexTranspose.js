// ======================================================================
// OPTIONS
// ======================================================================

const thumbSizeSmall = 360;
const thumbSizeMedium = 600;
const thumbPlaceholder = '/images/artwork-placeholder.png';

// ======================================================================
// TRANSPOSE PLEX DATA
// ======================================================================

/*
We are transposing the Plex data to a format that is easier to work with in the app,
and doing some additional processing and validation.
*/

const getThumb = (plexBaseUrl, thumb, size, accessToken) => {
  return thumb
    ? `${plexBaseUrl}/photo/:/transcode?width=${size}&height=${size}&url=${encodeURIComponent(
        thumb
      )}&minSize=1&X-Plex-Token=${accessToken}`
    : thumbPlaceholder;
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

export const transposeFolderData = (folder, index, libraryId, plexBaseUrl, accessToken) => {
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

export const transposeGenreData = (type, genre, libraryId) => {
  return {
    kind: 'genre',
    libraryId: libraryId,
    genreId: genre.key,
    title: genre.title.replace(/\//g, ' & '),
    link: '/' + type + '-genres/' + libraryId + '/' + genre.key,
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

export const transposeMoodData = (type, mood, libraryId) => {
  return {
    kind: 'mood',
    libraryId: libraryId,
    moodId: mood.key,
    title: mood.title.replace(/\//g, ' & '),
    link: '/' + type + '-moods/' + libraryId + '/' + mood.key,
  };
};

export const transposeHubSearchData = (result, libraryId, libraryTitle, plexBaseUrl, accessToken) => {
  if (result?.type) {
    if (result.type === 'artist') {
      return {
        score: result.score,
        type: 'artist',
        icon: 'PeopleIcon',
        title: result.title,
        link: '/artists/' + libraryId + '/' + result.ratingKey,
        thumb: getThumb(plexBaseUrl, result.thumb, thumbSizeSmall, accessToken),
      };
    } else if (result.type === 'album') {
      return {
        score: result.score,
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
// HELPER FUNCTIONS
// ======================================================================
