import * as bridge from 'js/services/bridge';
import store from 'js/store/store';

/**
 * Builds the context menu entries for a playlist, for use with <ContextMenu>.
 * Works with any playlist object shaped like the entries in PlaylistArray / PlaylistDetail
 * (playlistId, playlistTitle).
 * @param playlist - The playlist to build entries for
 * @returns Array of entries for use with the shared MenuEntry renderer
 */

const useContextMenuPlaylists = (playlist) => {
  if (!playlist) {
    return [];
  }

  const { playlistId, playlistTitle } = playlist;

  return [
    {
      variant: 'action',
      label: 'Edit playlist',
      icon: 'PencilIcon',
      onSelect: () =>
        store.dispatch.dialogModel.showModal({ modal: 'PlaylistEdit', data: { playlistId, playlistTitle } }),
    },
    {
      variant: 'action',
      label: 'Delete playlist',
      icon: 'MinusCircleIcon',
      onSelect: () =>
        store.dispatch.dialogModel.showConfirm({
          icon: 'WarningTriangleIcon',
          title: `Are you sure you want to delete the playlist "${playlistTitle}"?`,
          body: 'This action cannot be undone.',
          yesButton: 'Delete',
          noButton: 'Cancel',
          yesCallback: async () => {
            store.dispatch.appModel.showBlocker();
            try {
              await bridge.deletePlaylist({ playlistId });
            } catch (_error) {
              // [TODO] add error handling
            } finally {
              store.dispatch.appModel.hideBlocker();
            }
          },
        }),
    },
  ];
};

export default useContextMenuPlaylists;
