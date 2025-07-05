// ======================================================================
// IMPORTS
// ======================================================================

import { GenericTagItems } from 'js/pages';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumMoodItems = () => {
  return (
    <GenericTagItems
      collectionFilter="moodId"
      collectionKey="AlbumMoods"
      itemsKey="AlbumMoodItems"
      singularName="Album"
      variant="albums"
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumMoodItems;
