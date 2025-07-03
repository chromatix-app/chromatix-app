// ======================================================================
// IMPORTS
// ======================================================================

import { GenericTagArray } from 'js/pages';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistGenreArray = () => {
  return (
    <GenericTagArray
      collectionKey="ArtistGenres"
      pageTitle="Artist Genres"
      singularName="Artist Genre"
      variant="artistGenres"
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistGenreArray;
