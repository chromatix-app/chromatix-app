// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ListSet, Loading, Title } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistDetail = () => {
  const { playlistId } = useParams();

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists);
  const currentPlaylist = allPlaylists?.filter((playlist) => playlist.id === playlistId)[0];

  const allPlaylistTracks = useSelector(({ appModel }) => appModel.allPlaylistTracks);
  const currentPlaylistTracks = allPlaylistTracks[playlistId];

  useEffect(() => {
    plex.getAllPlaylists();
    plex.getPlaylistTracks(playlistId);
  }, [playlistId]);

  return (
    <>
      <Title
        title={currentPlaylist?.title}
        subtitle={currentPlaylist?.artist ? 'by ' + currentPlaylist?.artist : null}
      />
      {!currentPlaylistTracks && <Loading forceVisible inline />}
      {currentPlaylistTracks && <ListSet entries={currentPlaylistTracks} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistDetail;
