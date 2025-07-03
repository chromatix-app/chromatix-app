// ======================================================================
// IMPORTS
// ======================================================================

import { GenericTagItems } from 'js/pages';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistGenreItems = () => {
  return (
    <GenericTagItems
      collectionFilter="genreId"
      collectionKey="ArtistGenres"
      itemsKey="ArtistGenreItems"
      singularName="Artist"
      variant="artists"
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistGenreItems;
