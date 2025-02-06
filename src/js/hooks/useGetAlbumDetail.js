import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';

import { durationToStringLong, sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAlbumDetail = ({ libraryId, albumId }) => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const sortAlbumTracks = useSelector(({ sessionModel }) => sessionModel.sortAlbumTracks);
  const currentSortString = sortAlbumTracks[albumId] || null;

  // prevent sorting by rating if ratings are hidden
  const isRatingSortHidden = !optionShowStarRatings && currentSortString?.startsWith('userRating');

  const albumSortString = isRatingSortHidden ? null : currentSortString;

  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums);
  const albumInfo = allAlbums?.find((album) => album.albumId === albumId);

  const allAlbumTracks = useSelector(({ appModel }) => appModel.allAlbumTracks);
  const albumTracks = allAlbumTracks[libraryId + '-' + albumId];

  const albumThumb = albumInfo?.thumb;
  const albumTitle = albumInfo?.title;
  const albumArtist = albumInfo?.artist;
  const albumReleaseDate = albumInfo?.releaseDate ? moment(albumInfo?.releaseDate).format('YYYY') : null;
  const albumDiscCount = useMemo(() => {
    return (
      albumTracks?.reduce((acc, entry) => {
        return Math.max(acc, entry.discNumber);
      }, 0) || 1
    );
  }, [albumTracks]);
  const albumTrackCount = albumTracks?.length;
  const albumDurationMillisecs = albumTracks?.reduce((acc, track) => acc + track.duration, 0);
  const albumDurationString = durationToStringLong(albumDurationMillisecs);
  const albumRating = albumInfo?.userRating;
  const albumArtistLink = albumInfo?.artistLink;

  const sortedAlbumTracks = useMemo(() => {
    if (!albumTracks) return null;
    if (albumSortString) {
      // Add originalIndex to each entry
      const entriesWithOriginalIndex = albumTracks.map((entry, index) => ({
        ...entry,
        originalIndex: index,
      }));
      // Sort entries
      if (albumSortString === 'sortOrder-desc') {
        return entriesWithOriginalIndex.slice().reverse();
      } else {
        return sortList(entriesWithOriginalIndex, albumSortString);
      }
    }
    // If not an album or no albumSortString, return original entries
    return albumTracks.map((entry, index) => ({
      ...entry,
      originalIndex: index,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAlbumTracks, albumTracks, albumSortString]);

  const albumOrder = useMemo(() => {
    return sortedAlbumTracks?.map((entry) => entry.originalIndex);
  }, [sortedAlbumTracks]);

  // Get the required album data
  useEffect(() => {
    // plex.getAllAlbums();
    if (!albumInfo) {
      plex.getAlbumDetails(libraryId, albumId);
    }
    plex.getAlbumTracks(libraryId, albumId);
  }, [albumId, libraryId]);

  // // Fallback in case album data is not included in the allAlbums array
  // useEffect(() => {
  //   console.log(allAlbums);
  //   if (allAlbums && !albumInfo) {
  //     plex.getAlbumDetails(libraryId, albumId);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [allAlbums, albumInfo]);

  return {
    albumInfo,

    albumThumb,
    albumTitle,
    albumArtist,
    albumReleaseDate,
    albumDiscCount,
    albumTrackCount,
    albumDurationString,
    albumRating,
    albumArtistLink,

    albumTracks: sortedAlbumTracks,
    albumOrder,
    albumSortString,
  };
};

export default useGetAlbumDetail;
