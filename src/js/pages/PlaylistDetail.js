// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import moment from 'moment';

import { ListSet, Loading, TitleBlock } from 'js/components';
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

  const playlistThumb = currentPlaylist?.thumb;
  const playlistTitle = currentPlaylist?.title;
  const playlistTracks = currentPlaylistTracks?.length;
  const playlistDurationMilli = currentPlaylistTracks?.reduce((acc, track) => acc + track.duration, 0);
  const playlistDurationSecs = moment.duration(playlistDurationMilli, 'milliseconds').asSeconds();
  const playlistDurationMins = `${Math.round(playlistDurationSecs / 60)}`;

  useEffect(() => {
    plex.getAllPlaylists();
    plex.getPlaylistTracks(playlistId);
  }, [playlistId]);

  return (
    <>
      {currentPlaylist && (
        <TitleBlock
          thumb={playlistThumb}
          title={playlistTitle}
          subtitle={currentPlaylistTracks && playlistTracks + ' tracks'}
          detail={currentPlaylistTracks && playlistDurationMins + ' mins'}
        />
      )}
      {!(currentPlaylist && currentPlaylistTracks) && <Loading forceVisible inline />}
      {currentPlaylist && currentPlaylistTracks && (
        <ListSet variant="playlist" playlistId={playlistId} entries={currentPlaylistTracks} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistDetail;
