import * as bridge from 'js/services/bridge';
import store from 'js/store/store';

/**
 * Builds the context menu entries for an album, for use with <ContextMenu>.
 * Works with any album object shaped like the entries in ViewList / ViewGrid (albumId, artistLink etc).
 * Pass collectionId when the album is displayed within a collection's items page, to show "Remove from collection".
 * Collections are preloaded app-wide by SideBar, so this does not fetch them itself.
 * @param album - The album to build entries for
 * @param options.showArtist - Show "Go to Artist" (default true; pass false e.g. when already on the artist page)
 * @param options.showAlbum - Show "Go to Album" (default true; pass false e.g. when already on the album page)
 * @returns Array of entries for use with the shared MenuEntry renderer
 */

const useContextMenuAlbums = (album, { showArtist = true, showAlbum = true } = {}) => {
  if (!album) {
    return [];
  }

  const hasContextArtist = !!album.artistLink && showArtist;
  const hasContextAlbum = !!album.link && showAlbum;
  const hasContextDivider = hasContextArtist || hasContextAlbum;

  return [
    {
      variant: 'submenu',
      label: 'Add to playlist',
      icon: 'PlusCircleIcon',
      emptyLabel: 'No playlists found',
      getEntries: () => {
        const playlists = store.getState().appModel.allPlaylists || [];
        return playlists.map((playlist) => ({
          variant: 'action',
          label: playlist.title,
          onSelect: async () => {
            const libraryId = store.getState().sessionModel.currentLibrary?.libraryId;
            const albumTracksKey = libraryId + '-' + album.albumId;
            let albumTracks = store.getState().appModel.allAlbumTracks[albumTracksKey];
            if (!albumTracks) {
              await bridge.getAlbumTracks(libraryId, album.albumId);
              albumTracks = store.getState().appModel.allAlbumTracks[albumTracksKey];
            }
            const trackIds = (albumTracks || []).map((track) => track.trackId);
            if (trackIds.length) {
              bridge.addTracksToPlaylist({ playlistId: playlist.playlistId, trackIds });
            }
          },
        }));
      },
    },
    {
      variant: 'submenu',
      label: 'Add to collection',
      icon: 'PlusCircleIcon',
      emptyLabel: 'No collections found',
      getEntries: () => {
        const collections = store.getState().appModel.allAlbumCollections || [];
        return collections.map((collection) => ({
          variant: 'action',
          label: collection.title,
          onSelect: () => {
            const libraryId = store.getState().sessionModel.currentLibrary?.libraryId;
            bridge.addItemsToCollection({
              collectionId: collection.collectionId,
              libraryId,
              typeKey: 'Album',
              itemIds: [album.albumId],
            });
          },
        }));
      },
    },
    ...(album.collectionId
      ? [
          {
            variant: 'action',
            label: 'Remove from collection',
            icon: 'MinusCircleIcon',
            onSelect: () => {
              const libraryId = store.getState().sessionModel.currentLibrary?.libraryId;
              bridge.removeItemFromCollection({
                collectionId: album.collectionId,
                libraryId,
                typeKey: 'Album',
                itemId: album.albumId,
              });
            },
          },
        ]
      : []),
    ...(hasContextDivider ? [{ variant: 'divider' }] : []),
    ...(hasContextArtist
      ? [{ variant: 'action', label: 'Go to artist', icon: 'PeopleIcon', to: album.artistLink }]
      : []),
    ...(hasContextAlbum ? [{ variant: 'action', label: 'Go to album', icon: 'PlayCircleIcon', to: album.link }] : []),
  ];
};

export default useContextMenuAlbums;
