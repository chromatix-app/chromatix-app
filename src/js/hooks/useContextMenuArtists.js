import * as bridge from 'js/services/bridge';
import store from 'js/store/store';

/**
 * Builds the context menu entries for an artist, for use with <ContextMenu>.
 * Works with any artist object shaped like the entries in ViewList / ViewGrid (artistId, link etc).
 * Pass collectionId when the artist is displayed within a collection's items page, to show "Remove from collection".
 * Collections are preloaded app-wide by SideBar, so this does not fetch them itself.
 * @param artist - The artist to build entries for
 * @param options.showArtist - Show "Go to Artist" (default true; pass false e.g. when already on the artist page)
 * @returns Array of entries for use with the shared MenuEntry renderer
 */

const useContextMenuArtists = (artist, { showArtist = true } = {}) => {
  if (!artist) {
    return [];
  }

  const hasContextArtist = !!artist.link && showArtist;

  return [
    {
      variant: 'submenu',
      label: 'Add to collection',
      icon: 'PlusCircleIcon',
      getEntries: () => {
        const collections = store.getState().appModel.allArtistCollections || [];
        return [
          {
            variant: 'action',
            label: 'New collection',
            icon: 'PlusIcon',
            onSelect: () => {
              // deferred so it opens after Radix returns focus to the trigger on menu close,
              // otherwise that focus-return wins the race and steals focus from the modal's input
              setTimeout(() => {
                store.dispatch.dialogModel.showModal({
                  modal: 'CollectionAdd',
                  data: { type: 'artist', itemId: artist.artistId },
                });
              }, 100);
            },
          },
          ...(collections.length ? [{ variant: 'divider' }] : []),
          ...collections.map((collection) => ({
            variant: 'action',
            label: collection.title,
            onSelect: () => {
              const libraryId = store.getState().sessionModel.currentLibrary?.libraryId;
              bridge.addItemsToCollection({
                collectionId: collection.collectionId,
                libraryId,
                typeKey: 'Artist',
                itemIds: [artist.artistId],
              });
            },
          })),
        ];
      },
    },
    ...(artist.collectionId
      ? [
          {
            variant: 'action',
            label: 'Remove from collection',
            icon: 'MinusCircleIcon',
            onSelect: () => {
              const libraryId = store.getState().sessionModel.currentLibrary?.libraryId;
              bridge.removeItemFromCollection({
                collectionId: artist.collectionId,
                libraryId,
                typeKey: 'Artist',
                itemId: artist.artistId,
              });
            },
          },
        ]
      : []),
    ...(hasContextArtist
      ? [{ variant: 'divider' }, { variant: 'action', label: 'Go to artist', icon: 'PeopleIcon', to: artist.link }]
      : []),
  ];
};

export default useContextMenuArtists;
