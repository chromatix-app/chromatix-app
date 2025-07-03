// ======================================================================
// IMPORTS
// ======================================================================

import { GenericTagItems } from 'js/pages';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumGenreItems = () => {
  return (
    <GenericTagItems
      collectionFilter="genreId"
      collectionKey="AlbumGenres"
      itemsKey="AlbumGenreItems"
      singularName="Album"
      variant="albums"
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumGenreItems;
