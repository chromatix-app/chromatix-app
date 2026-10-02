// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Dialog from '@radix-ui/react-dialog';

import { Button, FormInput, ModalWindow } from 'js/components';
import * as bridge from 'js/services/bridge';
import { validateEntityName } from 'js/utils';
import style from './modals.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const CollectionEdit = () => {
  const dispatch = useDispatch();
  const currentModalData = useSelector(({ dialogModel }) => dialogModel.currentModalData);
  const allArtistCollections = useSelector(({ appModel }) => appModel.allArtistCollections);
  const allAlbumCollections = useSelector(({ appModel }) => appModel.allAlbumCollections);

  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentModalData?.collectionTitle) {
      setTitle(currentModalData.collectionTitle);
    }
  }, [currentModalData]);

  const allCollections = currentModalData?.collectionType === 'artist' ? allArtistCollections : allAlbumCollections;
  const existingTitles = (allCollections || [])
    .filter((collection) => collection.collectionId !== currentModalData?.collectionId)
    .map((collection) => collection.title);
  const validationError = validateEntityName(title, existingTitles, currentModalData?.collectionTitle);

  const handleSubmit = async () => {
    if (validationError) return;
    setLoading(true);
    dispatch.appModel.showBlocker();
    try {
      await bridge.editCollection({
        collectionId: currentModalData.collectionId,
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
        <h1 className={style.title}>Edit Collection</h1>
      </Dialog.Title>

      <Dialog.Description asChild>
        <div className={style.body}>
          <FormInput
            size="large"
            color="secondary"
            type="text"
            placeholder="Collection title"
            value={title}
            autoFocus
            maxLength={128}
            disabled={loading}
            onChange={setTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            error={title.trim() && validationError ? validationError : undefined}
          />
        </div>
      </Dialog.Description>

      <div className={style.buttons}>
        <Button onClick={handleSubmit} size="small" color="mono" disabled={!!validationError} loading={loading}>
          Save Collection
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

export default CollectionEdit;
