// ======================================================================
// IMPORTS
// ======================================================================

import { GenericTagItems } from 'js/pages';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistTagItems = () => {
  return (
    <GenericTagItems
      collectionFilter="tagId"
      collectionKey="ArtistTags"
      itemsKey="ArtistTagItems"
      singularName="Artist"
      variant="artists"
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistTagItems;
