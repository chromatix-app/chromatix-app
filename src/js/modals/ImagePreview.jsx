// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';

import { ModalWindow } from 'js/components';

import style from './modals.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ImagePreview = () => {
  const dispatch = useDispatch();

  const currentModalData = useSelector((state) => state.dialogModel.currentModalData);

  if (!currentModalData?.src) return null;

  return (
    <ModalWindow variant="ImagePreview">
      <VisuallyHidden>
        <Dialog.Title>Image preview</Dialog.Title>
        <Dialog.Description>This is an expanded preview of a thumbnail image.</Dialog.Description>
      </VisuallyHidden>

      <div className={style.imagePreview}>
        <img src={currentModalData.src} alt={currentModalData?.title} />
      </div>

      <button
        type="button"
        className={clsx(style.closeButton, style.closeButtonImagePreview)}
        onClick={() => dispatch.dialogModel.closeModal()}
      >
        <span className="u-hidden">Close</span>
      </button>
    </ModalWindow>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ImagePreview;
