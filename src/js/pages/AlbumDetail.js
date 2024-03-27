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

  const releaseYear = currentAlbum?.releaseDate ? moment(currentAlbum?.releaseDate).format('YYYY') : null;

  useEffect(() => {
    plex.getAllAlbums();
    plex.getAlbumTracks(albumId);
  }, [albumId]);

  return (
    <>
      <Title
        title={currentAlbum?.title}
        subtitle={
          currentAlbum?.artist
            ? 'by ' +
              currentAlbum?.artist +
              ' • ' +
              releaseYear +
              ' • ' +
              currentAlbumTracks?.length +
              ' tracks • duration'
            : null
        }
      />
      {!currentAlbumTracks && <Loading forceVisible inline />}
      {currentAlbumTracks && <ListSet entries={currentAlbumTracks} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumDetail;
