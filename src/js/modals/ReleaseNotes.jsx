// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';
import * as Dialog from '@radix-ui/react-dialog';

import { Button, ModalWindow } from 'js/components';
import style from './modals.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ReleaseNotes = () => {
  const dispatch = useDispatch();

  return (
    <ModalWindow theme="release">
      <Dialog.Title asChild>
        <h1 className={style.title}>Version 1.0 launched</h1>
      </Dialog.Title>

      <Dialog.Description asChild>
        <div className={style.body}>
          <p className="color-orange font-balance">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus venenatis ligula nunc, vel maximus est
            tincidunt et. Aliquam sit amet ligula vel est dictum laoreet a in sem. Donec commodo dolor urna, eget
            ultrices odio ultricies sit amet. Nullam consequat augue eu diam malesuada, sed cursus ex rhoncus. Donec
            elementum odio sit amet sem feugiat tincidunt.
          </p>
          <p>
            Nunc eu eros nec est porta auctor in sit amet mauris. Vivamus et augue nisl. Donec tempor et lorem non
            semper. Ut sed lacinia odio. Donec laoreet venenatis sagittis. Cras fringilla lectus ac hendrerit
            pellentesque. Donec ultricies elementum volutpat. Nam molestie enim metus, non sollicitudin urna auctor
            viverra. Phasellus est odio, sagittis at dolor ac, elementum sollicitudin erat.
          </p>
        </div>
      </Dialog.Description>

      <div className={style.buttons}>
        <Button color="orangeBtn" size="modal" spacer="" onClick={dispatch.dialogModel.closeModal}>
          Close
        </Button>
      </div>
    </ModalWindow>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ReleaseNotes;
