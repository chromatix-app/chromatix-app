// ======================================================================
// IMPORTS
// ======================================================================

import { useId, useState } from 'react';
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

  // [NOTE] the modal unmounts when closed, so the title only needs setting when it opens
  const [title, setTitle] = useState(currentModalData?.collectionTitle ?? '');
  const [typedSortTitle, setTypedSortTitle] = useState(null);
  const [loading, setLoading] = useState(false);

  const titleId = useId();
  const sortTitleId = useId();

  const allCollections = currentModalData?.collectionType === 'artist' ? allArtistCollections : allAlbumCollections;
  const existingTitles = (allCollections || [])
    .filter((collection) => collection.collectionId !== currentModalData?.collectionId)
    .map((collection) => collection.title);
  const validationError = validateEntityName(title, existingTitles, currentModalData?.collectionTitle);

  // Plex keeps a hand-set sort title through a rename, so until the sort title is typed in, it follows
  // the title: the current sort title while the title is unchanged, and cleared once it's renamed
  // (a change of capitalisation only doesn't count)
  const originalSortTitle =
    allCollections?.find((collection) => collection.collectionId === currentModalData?.collectionId)?.sortTitle ?? '';
  const isRenamed = title.trim().toLowerCase() !== (currentModalData?.collectionTitle ?? '').trim().toLowerCase();
  const sortTitle = typedSortTitle ?? (isRenamed ? '' : originalSortTitle);

  const handleSubmit = async () => {
    if (validationError) return;
    setLoading(true);
    dispatch.appModel.showBlocker();
    try {
      // [NOTE] also sent on a rename, to clear a hand-set sort title that isn't shown here
      // (e.g. one that matches the title)
      const isSortTitleChanged = isRenamed || sortTitle.trim() !== originalSortTitle;
      // a sort title matching the title is cleared instead, so Plex generates its own
      const isSameAsTitle = sortTitle.trim().toLowerCase() === title.trim().toLowerCase();
      await bridge.editCollection({
        collectionId: currentModalData.collectionId,
        title: title.trim(),
        ...(isSortTitleChanged && { sortTitle: isSameAsTitle ? '' : sortTitle.trim() }),
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
          <div className={style.field}>
            <label htmlFor={titleId} className={style.label}>
              Title
            </label>
            <FormInput
              id={titleId}
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
          <div className={style.field}>
            <label htmlFor={sortTitleId} className={style.label}>
              Sort title
            </label>
            <FormInput
              id={sortTitleId}
              size="large"
              color="secondary"
              type="text"
              placeholder="Default"
              value={sortTitle}
              maxLength={128}
              disabled={loading}
              onChange={setTypedSortTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
          </div>
        </div>
      </Dialog.Description>

      <div className={style.buttons}>
        <Button onClick={handleSubmit} size="small" color="mono" disabled={!!validationError} loading={loading}>
          Save Collection
        </Button>
        <Button onClick={() => dispatch.dialogModel.closeModal()} size="small" color="onSecondary" disabled={loading}>
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
