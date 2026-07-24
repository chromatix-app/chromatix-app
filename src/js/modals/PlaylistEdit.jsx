// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Dialog from '@radix-ui/react-dialog';

import { Button, ModalWindow } from 'js/components';
import * as bridge from 'js/services/bridge';
import { validateEntityName } from 'js/utils';
import style from './modals.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistEdit = () => {
  const dispatch = useDispatch();
  const currentModalData = useSelector(({ dialogModel }) => dialogModel.currentModalData);
  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists);

  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentModalData?.playlistTitle) {
      setTitle(currentModalData.playlistTitle);
    }
  }, [currentModalData]);

  const existingTitles = (allPlaylists || [])
    .filter((playlist) => playlist.playlistId !== currentModalData?.playlistId)
    .map((playlist) => playlist.title);
  const validationError = validateEntityName(title, existingTitles, currentModalData?.playlistTitle);

  const handleSubmit = async () => {
    if (validationError) return;
    setLoading(true);
    dispatch.appModel.showBlocker();
    try {
      await bridge.editPlaylist({
        playlistId: currentModalData.playlistId,
        title: title.trim(),
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
        <h1 className={style.title}>Edit Playlist</h1>
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
          Save Playlist
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

export default PlaylistEdit;
