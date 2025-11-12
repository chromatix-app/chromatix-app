// ======================================================================
// IMPORTS
// ======================================================================

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';

import { Button, ModalWindow } from 'js/components';
import whatsNew from 'js/_config/whatsNew';

import style from './modals.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ReleaseNotes = () => {
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLightTheme = useSelector((state) => state.sessionModel.isLightTheme);
  const currentSlide = whatsNew[currentIndex];

  const currentImage = isLightTheme ? currentSlide.imageLight : currentSlide.imageDark;

  const handleNext = () => {
    if (currentIndex < whatsNew.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      dispatch.dialogModel.closeModal();
    }
  };

  return (
    <ModalWindow variant="ReleaseNotes">
      <div className={style.releaseLeft}>
        <div>
          <p className={style.date}>{currentSlide.date}</p>

          <Dialog.Title asChild>
            <h1 className={style.title}>{currentSlide.title}</h1>
          </Dialog.Title>

          <Dialog.Description asChild>
            <div className={style.body} dangerouslySetInnerHTML={{ __html: currentSlide.body }}></div>
          </Dialog.Description>
        </div>

        <div>
          <div className={style.dots}>
            {whatsNew.map((_, index) => (
              <span
                key={index}
                className={clsx(style.dot, { [style.dotActive]: index === currentIndex })}
                onClick={() => setCurrentIndex(index)}
              >
                <span className={style.dotInner}></span>
              </span>
            ))}
          </div>

          <div className={clsx(style.buttons, style.buttonsLeft)}>
            <Button size="small" color="mono" onClick={handleNext}>
              {currentIndex < whatsNew.length - 1 ? 'Next' : 'Close'}
            </Button>
          </div>
        </div>
      </div>

      <div className={clsx(style.releaseRight, { [style.releaseRightLight]: isLightTheme })}>
        <picture>
          <source srcSet={`/images/webp/${currentImage}.webp`} type="image/webp" />
          <img key={currentImage} src={`/images/compressed/${currentImage}.png`} alt="" draggable="false" />
        </picture>
      </div>

      <button className={style.closeButton} onClick={() => dispatch.dialogModel.closeModal()}>
        <span className="u-hidden">Close</span>
      </button>
    </ModalWindow>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ReleaseNotes;
