// ======================================================================
// IMPORTS
// ======================================================================

import { GenericTagItems } from 'js/pages';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumTagItems = () => {
  return (
    <GenericTagItems
      collectionFilter="tagId"
      collectionKey="AlbumTags"
      itemsKey="AlbumTagItems"
      singularName="Album"
      variant="albums"
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumTagItems;
