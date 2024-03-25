// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Title } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumDetail = () => {
  const { albumId } = useParams();

  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums);
  const currentAlbum = allAlbums?.filter((album) => album.id === albumId)[0];

  const albumTracks = useSelector(({ appModel }) => appModel.albumTracks);

  return (
    <main>
      <Title title={currentAlbum?.title} subtitle={currentAlbum?.artist ? 'bg ' + currentAlbum?.artist : null} />
      {albumTracks?.map((track, index) => (
        <div key={index}>
          <div>{track.name}</div>
        </div>
      ))}
    </main>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumDetail;
