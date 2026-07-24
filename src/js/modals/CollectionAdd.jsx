// ======================================================================
// IMPORTS
// ======================================================================

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Dialog from '@radix-ui/react-dialog';

import { Button, ModalWindow } from 'js/components';
import * as bridge from 'js/services/bridge';
import style from './modals.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const CollectionAdd = () => {
  const dispatch = useDispatch();
  const currentModalData = useSelector(({ dialogModel }) => dialogModel.currentModalData);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    dispatch.appModel.showBlocker();
    try {
      await bridge.createCollection({
        title: title.trim(),
        type: currentModalData.type,
        itemIds: [currentModalData.itemId],
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
        <h1 className={style.title}>New Collection</h1>
      </Dialog.Title>

      <Dialog.Description asChild>
        <div className={style.body}>
          <input
            className={style.input}
            type="text"
            placeholder="Collection title"
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
          Create Collection
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

export default CollectionAdd;
