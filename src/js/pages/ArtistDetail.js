// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Title } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistDetail = () => {
  const { artistId } = useParams();

  const allArtists = useSelector(({ appModel }) => appModel.allArtists);
  const currentArtist = allArtists?.filter((artist) => artist.id === artistId)[0];

  return (
    <>
      <Title title={currentArtist?.title} />
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistDetail;
