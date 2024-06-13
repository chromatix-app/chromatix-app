import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { durationToStringLong, sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetPlaylistDetail = ({ libraryId, playlistId }) => {
  const sortPlaylistTracks = useSelector(({ sessionModel }) => sessionModel.sortPlaylistTracks);
  const sortKey = sortPlaylistTracks[playlistId] || null;

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists);
  const playlistInfo = allPlaylists?.filter((playlist) => playlist.playlistId === playlistId)[0];

  const allPlaylistTracks = useSelector(({ appModel }) => appModel.allPlaylistTracks);
  const playlistTracks = allPlaylistTracks[libraryId + '-' + playlistId];

  const playlistThumb = playlistInfo?.thumb;
  const playlistTitle = playlistInfo?.title;
  const playlistTrackCount = playlistTracks?.length;
  const playlistDurationMillisecs = playlistTracks?.reduce((acc, track) => acc + track.duration, 0);
  const playlistDurationString = durationToStringLong(playlistDurationMillisecs);
  const playlistRating = playlistInfo?.userRating;

  const sortedPlaylistTracks = useMemo(() => {
    if (!playlistTracks) return null;
    if (sortKey) {
      // Add originalIndex to each entry
      const entriesWithOriginalIndex = playlistTracks.map((entry, index) => ({
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
    // If not a playlist or no sortKey, return original entries
    return playlistTracks.map((entry, index) => ({
      ...entry,
      originalIndex: index,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPlaylistTracks, playlistTracks, sortKey]);

  const playlistOrder = useMemo(() => {
    return sortedPlaylistTracks?.map((entry) => entry.originalIndex);
  }, [sortedPlaylistTracks]);

  useEffect(() => {
    plex.getAllPlaylists();
    plex.getPlaylistTracks(libraryId, playlistId);
  }, [libraryId, playlistId]);

  useEffect(() => {
    if (allPlaylists && !playlistInfo) {
      plex.getPlaylistDetails(libraryId, playlistId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPlaylists, playlistInfo]);

  return {
    playlistInfo,

    playlistThumb,
    playlistTitle,
    playlistTrackCount,
    playlistDurationString,
    playlistRating,

    playlistTracks: sortedPlaylistTracks,
    playlistOrder,
  };
};

export default useGetPlaylistDetail;
