import * as bridge from 'js/services/bridge';
import store from 'js/store/store';

// Builds the context menu entries for an album, for use with <ContextMenu>.
// Works with any album object shaped like the entries in ViewList / ViewGrid
// (albumId, artistLink etc).
//
// Options:
// - showArtist: show "Go to Artist" (default true; pass false e.g. when already on the artist page)

const useContextMenuAlbums = (album, { showArtist = true } = {}) => {
  if (!album) {
    return [];
  }

  const hasContextArtist = !!album.artistLink && showArtist;

  return [
    {
      variant: 'submenu',
      label: 'Add to Playlist',
      icon: 'PlusCircleIcon',
      getEntries: () => {
        const playlists = store.getState().appModel.allPlaylists || [];
        return playlists.map((playlist) => ({
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
    ...(hasContextArtist
      ? [{ variant: 'divider' }, { label: 'Go to Artist', icon: 'PeopleIcon', to: album.artistLink }]
      : []),
  ];
};

export default useContextMenuAlbums;
