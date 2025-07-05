// ======================================================================
// IMPORTS
// ======================================================================

import { GenericTagItems } from 'js/pages';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistMoodItems = () => {
  return (
    <GenericTagItems
      collectionFilter="moodId"
      collectionKey="ArtistMoods"
      itemsKey="ArtistMoodItems"
      singularName="Artist"
      variant="artists"
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistMoodItems;
