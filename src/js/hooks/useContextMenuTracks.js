import * as bridge from 'js/services/bridge';
import store from 'js/store/store';

/**
 * Builds the context menu entries for a track, for use with <ContextMenu>.
 * Works with any track object shaped like the entries in playingTrackList / ViewList
 * (trackId, artistLink, albumLink, playlistItemID etc).
 * @param track - The track to build entries for
 * @param options.playlistId - Enables "Remove from Playlist" (requires track.playlistItemID)
 * @param options.showArtist - Show "Go to Artist" (default true; pass false e.g. when already on the artist page)
 * @param options.showAlbum - Show "Go to Album" (default true; pass false e.g. when already on the album page)
 * @returns Array of entries for use with the shared MenuEntry renderer
 */

const useContextMenuTracks = (track, { playlistId, showArtist = true, showAlbum = true } = {}) => {
  if (!track) {
    return [];
  }

  const hasContextRemove = !!playlistId && !!track.playlistItemID;
  const hasContextArtist = !!track.artistLink && showArtist;
  const hasContextAlbum = !!track.albumLink && showAlbum;
  const hasContextDivider = hasContextArtist || hasContextAlbum;

  return [
    {
      variant: 'submenu',
      label: 'Add to Playlist',
      icon: 'PlusCircleIcon',
      getEntries: () => {
        const playlists = store.getState().appModel.allPlaylists || [];
        return playlists.map((playlist) => ({
          variant: 'action',
          label: playlist.title,
          onSelect: () => bridge.addTracksToPlaylist({ playlistId: playlist.playlistId, trackIds: [track.trackId] }),
        }));
      },
    },
    ...(hasContextRemove
      ? [
          {
            variant: 'action',
            label: 'Remove from Playlist',
            icon: 'MinusCircleIcon',
            onSelect: () => bridge.removeTrackFromPlaylist({ playlistId, playlistItemId: track.playlistItemID }),
          },
        ]
      : []),
    ...(hasContextDivider ? [{ variant: 'divider' }] : []),
    ...(hasContextArtist
      ? [{ variant: 'action', label: 'Go to Artist', icon: 'PeopleIcon', to: track.artistLink }]
      : []),
    ...(hasContextAlbum
      ? [{ variant: 'action', label: 'Go to Album', icon: 'PlayCircleIcon', to: track.albumLink }]
      : []),
  ];
};

export default useContextMenuTracks;
