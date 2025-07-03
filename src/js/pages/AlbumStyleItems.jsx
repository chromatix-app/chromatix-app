// ======================================================================
// IMPORTS
// ======================================================================

import { GenericTagItems } from 'js/pages';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumStyleItems = () => {
  return (
    <GenericTagItems
      collectionFilter="styleId"
      collectionKey="AlbumStyles"
      itemsKey="AlbumStyleItems"
      singularName="Album"
      variant="albums"
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumStyleItems;
