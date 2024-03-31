// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ListSet, Loading, TitleHeading } from 'js/components';
import { durationToStringLong } from 'js/utils';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistDetail = () => {
  const { playlistId } = useParams();

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists);
  const currentPlaylist = allPlaylists?.filter((playlist) => playlist.playlistId === playlistId)[0];

  const allPlaylistTracks = useSelector(({ appModel }) => appModel.allPlaylistTracks);
  const currentPlaylistTracks = allPlaylistTracks[playlistId];

  const playlistThumb = currentPlaylist?.thumb;
  const playlistTitle = currentPlaylist?.title;
  const playlistTracks = currentPlaylistTracks?.length;
  const playlistDurationMillisecs = currentPlaylistTracks?.reduce((acc, track) => acc + track.duration, 0);
  const playlistDurationString = durationToStringLong(playlistDurationMillisecs);

  useEffect(() => {
    plex.getAllPlaylists();
    plex.getPlaylistTracks(playlistId);
  }, [playlistId]);

  return (
    <>
      {currentPlaylist && (
        <TitleHeading
          thumb={playlistThumb}
          title={playlistTitle}
          subtitle={currentPlaylistTracks ? playlistTracks + ' tracks' : <>&nbsp;</>}
          detail={currentPlaylistTracks ? playlistDurationString : <>&nbsp;</>}
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
