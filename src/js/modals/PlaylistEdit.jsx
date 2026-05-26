// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Dialog from '@radix-ui/react-dialog';

import { Button, ModalWindow } from 'js/components';
import * as bridge from 'js/services/bridge';
import style from './modals.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistEdit = () => {
  const dispatch = useDispatch();
  const currentModalData = useSelector(({ dialogModel }) => dialogModel.currentModalData);

  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentModalData?.playlistTitle) {
      setTitle(currentModalData.playlistTitle);
    }
  }, [currentModalData]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    dispatch.appModel.showBlocker();
    try {
      await bridge.editPlaylist({ playlistId: currentModalData.playlistId, title: title.trim() });
      dispatch.dialogModel.closeModal();
    } catch (_error) {
      // [TODO] add error handling
    }
    dispatch.appModel.hideBlocker();
  };

  const handleDelete = () => {
    dispatch.dialogModel.showConfirm({
      icon: 'WarningTriangleIcon',
      title: 'Are you sure you want to delete the playlist "' + currentModalData.playlistTitle + '"?',
      body: 'This action cannot be undone.',
      yesButton: 'Delete',
      noButton: 'Cancel',
      yesCallback: async () => {
        setLoading(true);
        dispatch.appModel.showBlocker();
        try {
          await bridge.deletePlaylist({ playlistId: currentModalData.playlistId });
          dispatch.dialogModel.closeModal();
        } catch (_error) {
          // [TODO] add error handling
        }
        dispatch.appModel.hideBlocker();
      },
    });
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
        </div>
      </Dialog.Description>

      <div className={style.buttons}>
        <Button onClick={handleSubmit} size="small" color="mono" disabled={!title.trim()} loading={loading}>
          Save Playlist
        </Button>
        <Button onClick={() => dispatch.dialogModel.closeModal()} size="small" color="tertiary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleDelete} size="small" color="outlineTertiary" disabled={loading}>
          Delete Playlist
        </Button>
      </div>
    </ModalWindow>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistEdit;
