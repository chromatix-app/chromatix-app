// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ListTracks, Loading, StarRating, TitleHeading } from 'js/components';
import { durationToStringLong, sortList } from 'js/utils';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistDetail = () => {
  const { libraryId, playlistId } = useParams();

  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);
  const sortPlaylistTracks = useSelector(({ sessionModel }) => sessionModel.sortPlaylistTracks);
  const sortKey = sortPlaylistTracks[playlistId] || null;

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists);
  const currentPlaylist = allPlaylists?.filter((playlist) => playlist.playlistId === playlistId)[0];

  const allPlaylistTracks = useSelector(({ appModel }) => appModel.allPlaylistTracks);
  const currentPlaylistTracks = allPlaylistTracks[libraryId + '-' + playlistId];

  const playlistThumb = currentPlaylist?.thumb;
  const playlistTitle = currentPlaylist?.title;
  const playlistTracks = currentPlaylistTracks?.length;
  const playlistDurationMillisecs = currentPlaylistTracks?.reduce((acc, track) => acc + track.duration, 0);
  const playlistDurationString = durationToStringLong(playlistDurationMillisecs);
  const playlistRating = currentPlaylist?.userRating;

  const sortedPlaylistTracks = useMemo(() => {
    if (!currentPlaylistTracks) return null;
    if (sortKey) {
      // Add originalIndex to each entry
      const entriesWithOriginalIndex = currentPlaylistTracks.map((entry, index) => ({
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
    return currentPlaylistTracks.map((entry, index) => ({
      ...entry,
      originalIndex: index,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPlaylistTracks, currentPlaylistTracks, sortKey]);

  const playingOrder = useMemo(() => {
    return sortedPlaylistTracks?.map((entry) => entry.originalIndex);
  }, [sortedPlaylistTracks]);

  const doPlay = (isShuffle) => {
    dispatch.playerModel.playerLoadPlaylist({
      playlistId,
      isShuffle,
      playingOrder,
      trackIndex: isShuffle ? null : playingOrder ? playingOrder[0] : 0,
    });
  };

  useEffect(() => {
    plex.getAllPlaylists();
    plex.getPlaylistTracks(libraryId, playlistId);
  }, [libraryId, playlistId]);

  useEffect(() => {
    if (allPlaylists && !currentPlaylist) {
      plex.getPlaylistDetails(libraryId, playlistId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPlaylists, currentPlaylist]);

  return (
    <>
      {currentPlaylist && (
        <TitleHeading
          thumb={playlistThumb}
          title={playlistTitle}
          subtitle={currentPlaylistTracks ? playlistTracks + ' tracks' : <>&nbsp;</>}
          detail={
            currentPlaylistTracks ? (
              <>
                {playlistDurationString}
                {playlistDurationString && optionShowStarRatings && ' • '}
                {optionShowStarRatings && (
                  <StarRating
                    type="playlist"
                    ratingKey={playlistId}
                    rating={playlistRating}
                    inline
                    editable
                    alwaysVisible
                  />
                )}
              </>
            ) : (
              <>&nbsp;</>
            )
          }
          handlePlay={currentPlaylistTracks ? doPlay : null}
        />
      )}
      {!(currentPlaylist && currentPlaylistTracks) && <Loading forceVisible inline />}
      {currentPlaylist && currentPlaylistTracks && (
        <ListTracks
          variant="playlists"
          playlistId={playlistId}
          entries={sortedPlaylistTracks}
          playingOrder={playingOrder}
        />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistDetail;
