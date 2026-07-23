import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import platformFeatures from 'js/_config/platformFeatures';
import { durationToStringLong, sortList } from 'js/utils';
import * as bridge from 'js/services/bridge';

const useGetPlaylistDetail = ({ libraryId, playlistId }) => {
  const dispatch = useDispatch();

  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  const sortPlaylistTracks = useSelector(({ sessionModel }) => sessionModel.sortPlaylistTracks);
  const playlistSortString = sortPlaylistTracks[playlistId] || null;

  const colPlaylistArtwork = useSelector(({ sessionModel }) => sessionModel.colPlaylistArtwork);
  const colPlaylistArtist = useSelector(({ sessionModel }) => sessionModel.colPlaylistArtist);
  const colPlaylistAlbum = useSelector(({ sessionModel }) => sessionModel.colPlaylistAlbum);
  const colPlaylistCodec = useSelector(({ sessionModel }) => sessionModel.colPlaylistCodec);
  const colPlaylistBitrate = useSelector(({ sessionModel }) => sessionModel.colPlaylistBitrate);
  const colPlaylistDuration = useSelector(({ sessionModel }) => sessionModel.colPlaylistDuration);
  const colPlaylistUserRating = useSelector(({ sessionModel }) => sessionModel.colPlaylistUserRating);
  const colPlaylistIsFavourite = useSelector(({ sessionModel }) => sessionModel.colPlaylistIsFavourite);

  const optionSortNumbersFirst = useSelector(({ sessionModel }) => sessionModel.optionSortNumbersFirst);
  const optionSortIgnoreLeadingArticles = useSelector(
    ({ sessionModel }) => sessionModel.optionSortIgnoreLeadingArticles
  );

  // prevent sorting by a hidden field
  const allowedSort = {
    sortOrder: true,
    title: true,
    artist: colPlaylistArtist,
    album: colPlaylistAlbum,
    codec: colPlaylistCodec,
    bitrate: colPlaylistBitrate,
    duration: colPlaylistDuration,
    userRating: platformOpts.enableUserRating && colPlaylistUserRating,
    isFavourite: platformOpts.enableIsFavourite && colPlaylistIsFavourite,
  };
  const actualPlaylistSortString = allowedSort[playlistSortString?.split('-')[0]] ? playlistSortString : null;

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists);
  const playlistInfo = allPlaylists?.find((playlist) => playlist.playlistId === playlistId);

  const allPlaylistTracks = useSelector(({ appModel }) => appModel.allPlaylistTracks);
  const playlistTracks = allPlaylistTracks[libraryId + '-' + playlistId];

  const playlistThumb = playlistInfo?.thumbSm;
  const playlistThumbMedium = playlistInfo?.thumbMd;
  const playlistTitle = playlistInfo?.title;
  const playlistTrackCount = playlistTracks?.length;
  const playlistDurationMillisecs = playlistTracks?.reduce((acc, track) => acc + track.duration, 0);
  const playlistDurationString = durationToStringLong(playlistDurationMillisecs);
  const playlistRating = playlistInfo?.userRating;
  const playlistIsFavourite = playlistInfo?.isFavourite;

  const sortedPlaylistTracks = useMemo(() => {
    if (!playlistTracks) return null;
    if (actualPlaylistSortString) {
      // Add originalIndex to each entry
      const entriesWithOriginalIndex = playlistTracks.map((entry, index) => ({
        ...entry,
        originalIndex: index,
      }));
      // Sort entries
      if (actualPlaylistSortString === 'sortOrder-desc') {
        return entriesWithOriginalIndex.slice().reverse();
      } else {
        return sortList({
          entries: entriesWithOriginalIndex,
          options: actualPlaylistSortString,
          sortNumbersFirst: optionSortNumbersFirst,
          ignoreLeadingArticles: optionSortIgnoreLeadingArticles,
        });
      }
    }
    // If not a playlist or no actualPlaylistSortString, return original entries
    return playlistTracks.map((entry, index) => ({
      ...entry,
      originalIndex: index,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPlaylistTracks, playlistTracks, actualPlaylistSortString]);

  const playlistOrder = useMemo(() => {
    return sortedPlaylistTracks?.map((entry) => entry.originalIndex);
  }, [sortedPlaylistTracks]);

  const setColumnVisibility = (columnKey, columnValue) => {
    dispatch.sessionModel.setSessionState({
      [columnKey]: columnValue,
    });
  };

  useEffect(() => {
    // bridge.getAllPlaylists();
    // if (!playlistInfo) {
    bridge.getPlaylistDetails(libraryId, playlistId);
    // }
    bridge.getPlaylistTracks(libraryId, playlistId);
  }, [libraryId, playlistId]);

  // // Fallback in case playlist data is not included in the allPlaylists array
  // useEffect(() => {
  //   if (allPlaylists && !playlistInfo) {
  //     bridge.getPlaylistDetails(libraryId, playlistId);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [allPlaylists, playlistInfo]);

  return {
    playlistInfo,

    playlistThumb,
    playlistThumbMedium,
    playlistTitle,
    playlistTrackCount,
    playlistDurationString,
    playlistRating,
    playlistIsFavourite,

    playlistTracks: sortedPlaylistTracks,
    playlistOrder,
    playlistSortString: actualPlaylistSortString,

    colOptions: {
      artwork: colPlaylistArtwork,
      artist: colPlaylistArtist,
      album: colPlaylistAlbum,
      codec: colPlaylistCodec,
      bitrate: colPlaylistBitrate,
      duration: colPlaylistDuration,
      userRating: platformOpts.enableUserRating && colPlaylistUserRating,
      isFavourite: platformOpts.enableIsFavourite && colPlaylistIsFavourite,
    },
    setColumnVisibility,
  };
};

export default useGetPlaylistDetail;
