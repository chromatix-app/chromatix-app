import * as bridge from 'js/services/bridge';
import store from 'js/store/store';

/**
 * Builds the context menu entries for a collection, for use with <ContextMenu>.
 * Works with any collection object shaped like the entries in ArtistCollectionItems / AlbumCollectionItems
 * (collectionId, collectionTitle, collectionType, link).
 * Pass link (e.g. from grid/list entries) to show "Go to collection"; omit it on the collection's own detail page.
 * @param collection - The collection to build entries for
 * @returns Array of entries for use with the shared MenuEntry renderer
 */

const useContextMenuCollections = (collection) => {
  if (!collection) {
    return [];
  }

  const { collectionId, collectionTitle, collectionType, link } = collection;

  return [
    {
      variant: 'action',
      label: 'Edit collection',
      icon: 'PencilIcon',
      onSelect: () =>
        store.dispatch.dialogModel.showModal({ modal: 'CollectionEdit', data: { collectionId, collectionTitle } }),
    },
    {
      variant: 'action',
      label: 'Delete collection',
      icon: 'MinusCircleIcon',
      onSelect: () =>
        store.dispatch.dialogModel.showConfirm({
          icon: 'WarningTriangleIcon',
          title: `Are you sure you want to delete the collection "${collectionTitle}"?`,
          body: 'This action cannot be undone.',
          yesButton: 'Delete',
          noButton: 'Cancel',
          yesCallback: async () => {
            store.dispatch.appModel.showBlocker();
            try {
              await bridge.deleteCollection({ collectionId, type: collectionType });
            } catch (_error) {
              // [TODO] add error handling
            } finally {
              store.dispatch.appModel.hideBlocker();
            }
          },
        }),
    },
    ...(link
      ? [
          {
            variant: 'divider',
          },
          {
            variant: 'action',
            label: 'Go to collection',
            icon: collectionType === 'artist' ? 'ArtistCollectionsIcon' : 'AlbumCollectionsIcon',
            to: link,
          },
        ]
      : []),
  ];
};

export default useContextMenuCollections;
