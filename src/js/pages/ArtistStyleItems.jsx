// ======================================================================
// IMPORTS
// ======================================================================

import { GenericTagItems } from 'js/pages';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistStyleItems = () => {
  return (
    <GenericTagItems
      collectionFilter="styleId"
      collectionKey="ArtistStyles"
      itemsKey="ArtistStyleItems"
      singularName="Artist"
      variant="artists"
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistStyleItems;
