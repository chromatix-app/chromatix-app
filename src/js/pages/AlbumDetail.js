// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import moment from 'moment';

import { ListSet, Loading, Title } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumDetail = () => {
  const { albumId } = useParams();

  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums);
  const currentAlbum = allAlbums?.filter((album) => album.id === albumId)[0];

  const allAlbumTracks = useSelector(({ appModel }) => appModel.allAlbumTracks);
  const currentAlbumTracks = allAlbumTracks[albumId];

  const albumTitle = currentAlbum?.title;
  const albumArtist = currentAlbum?.artist;
  const albumRelease = currentAlbum?.releaseDate ? moment(currentAlbum?.releaseDate).format('YYYY') : null;
  const albumTracks = currentAlbumTracks?.length;
  const albumDurationMilli = currentAlbumTracks?.reduce((acc, track) => acc + track.duration, 0);
  const albumDurationSecs = moment.duration(albumDurationMilli, 'milliseconds').asSeconds();
  const albumDurationMins = `${Math.round(albumDurationSecs / 60)}`;

  useEffect(() => {
    plex.getAllAlbums();
    plex.getAlbumTracks(albumId);
  }, [albumId]);

  return (
    <>
      {currentAlbum && (
        <Title
          title={albumTitle}
          subtitle={albumArtist && albumArtist}
          detail={currentAlbumTracks && albumRelease + ' • ' + albumTracks + ' tracks • ' + albumDurationMins + ' mins'}
        />
      )}
      <>
        {!(currentAlbum && currentAlbumTracks) && <Loading forceVisible inline />}
        {currentAlbum && currentAlbumTracks && <ListSet variant="album" entries={currentAlbumTracks} />}
      </>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumDetail;
