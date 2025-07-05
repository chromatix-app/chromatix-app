// ======================================================================
// IMPORTS
// ======================================================================

import { GenericTagArray } from 'js/pages';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumGenreArray = () => {
  return (
    <GenericTagArray
      collectionKey="AlbumGenres"
      pageTitle="Album Genres"
      singularName="Album Genre"
      variant="albumGenres"
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumGenreArray;
