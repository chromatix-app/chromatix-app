import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';

import { durationToStringLong, sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAlbumDetail = ({ libraryId, albumId }) => {
  const sortAlbumTracks = useSelector(({ sessionModel }) => sessionModel.sortAlbumTracks);
  const sortKey = sortAlbumTracks[albumId] || null;

  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums);
  const albumInfo = allAlbums?.filter((album) => album.albumId === albumId)[0];

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
    if (sortKey) {
      // Add originalIndex to each entry
      const entriesWithOriginalIndex = albumTracks.map((entry, index) => ({
        ...entry,
        originalIndex: index,
      }));
      // Sort entries
      if (sortKey === 'sortOrder-desc') {
        return entriesWithOriginalIndex.slice().reverse();
      } else {
        return sortList(entriesWithOriginalIndex, sortKey);
      }
    }
    // If not an album or no sortKey, return original entries
    return albumTracks.map((entry, index) => ({
      ...entry,
      originalIndex: index,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAlbumTracks, albumTracks, sortKey]);

  const albumOrder = useMemo(() => {
    return sortedAlbumTracks?.map((entry) => entry.originalIndex);
  }, [sortedAlbumTracks]);

  useEffect(() => {
    plex.getAllAlbums();
    plex.getAlbumTracks(libraryId, albumId);
  }, [albumId, libraryId]);

  useEffect(() => {
    if (allAlbums && !albumInfo) {
      plex.getAlbumDetails(libraryId, albumId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAlbums, albumInfo]);

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
  };
};

export default useGetAlbumDetail;
