// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ListTracks, Loading, TitleHeading } from 'js/components';
import { durationToStringLong } from 'js/utils';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistDetail = () => {
  const { libraryId, playlistId } = useParams();

  const dispatch = useDispatch();

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists);
  const currentPlaylist = allPlaylists?.filter((playlist) => playlist.playlistId === playlistId)[0];

  const allPlaylistTracks = useSelector(({ appModel }) => appModel.allPlaylistTracks);
  const currentPlaylistTracks = allPlaylistTracks[libraryId + '-' + playlistId];

  const playlistThumb = currentPlaylist?.thumb;
  const playlistTitle = currentPlaylist?.title;
  const playlistTracks = currentPlaylistTracks?.length;
  const playlistDurationMillisecs = currentPlaylistTracks?.reduce((acc, track) => acc + track.duration, 0);
  const playlistDurationString = durationToStringLong(playlistDurationMillisecs);

  const doPlay = (isShuffle) => {
    dispatch.playerModel.playerLoadPlaylist({ playlistId, isShuffle });
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
          detail={currentPlaylistTracks ? playlistDurationString : <>&nbsp;</>}
          handlePlay={currentPlaylistTracks ? doPlay : null}
        />
      )}
      {!(currentPlaylist && currentPlaylistTracks) && <Loading forceVisible inline />}
      {currentPlaylist && currentPlaylistTracks && (
        <ListTracks variant="playlists" playlistId={playlistId} entries={currentPlaylistTracks} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistDetail;
