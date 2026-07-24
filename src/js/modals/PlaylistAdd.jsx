// ======================================================================
// IMPORTS
// ======================================================================

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Dialog from '@radix-ui/react-dialog';

import { Button, ModalWindow } from 'js/components';
import * as bridge from 'js/services/bridge';
import store from 'js/store/store';
import { validateEntityName } from 'js/utils';
import style from './modals.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

// If opened with modal data ({ trackIds } or { albumId }), the new playlist is seeded with those
// tracks at creation time and playback stays on the current page, rather than navigating to the new playlist.
const PlaylistAdd = () => {
  const dispatch = useDispatch();
  const currentModalData = useSelector(({ dialogModel }) => dialogModel.currentModalData);
  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const existingTitles = (allPlaylists || []).map((playlist) => playlist.title);
  const validationError = validateEntityName(title, existingTitles);

  const handleSubmit = async () => {
    if (validationError) return;
    setLoading(true);
    dispatch.appModel.showBlocker();
    try {
      const seedItem = currentModalData;
      let trackIds = seedItem?.trackIds;
      if (seedItem && !trackIds && seedItem.albumId) {
        const libraryId = store.getState().sessionModel.currentLibrary?.libraryId;
        const albumTracksKey = libraryId + '-' + seedItem.albumId;
        let albumTracks = store.getState().appModel.allAlbumTracks[albumTracksKey];
        if (!albumTracks) {
          await bridge.getAlbumTracks(libraryId, seedItem.albumId);
          albumTracks = store.getState().appModel.allAlbumTracks[albumTracksKey];
        }
        trackIds = (albumTracks || []).map((track) => track.trackId);
      }
      await bridge.createPlaylist({
        title: title.trim(),
        itemIds: trackIds,
        navigate: !seedItem,
      });
      dispatch.dialogModel.closeModal();
    } catch (_error) {
      // [TODO] add error handling
    } finally {
      setLoading(false);
      dispatch.appModel.hideBlocker();
    }
  };

  return (
    <ModalWindow variant="playlist">
      <Dialog.Title asChild>
        <h1 className={style.title}>New Playlist</h1>
      </Dialog.Title>

      <Dialog.Description asChild>
        <div className={style.body}>
          <input
            className={style.input}
            type="text"
            placeholder="Playlist title"
            value={title}
            autoFocus
            maxLength={128}
            disabled={loading}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
          {title.trim() && validationError && <p className={style.inputErrorMessage}>{validationError}</p>}
        </div>
      </Dialog.Description>

      <div className={style.buttons}>
        <Button onClick={handleSubmit} size="small" color="mono" disabled={!!validationError} loading={loading}>
          Create Playlist
        </Button>
        <Button onClick={() => dispatch.dialogModel.closeModal()} size="small" color="tertiary" disabled={loading}>
          Cancel
        </Button>
      </div>
    </ModalWindow>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistAdd;
