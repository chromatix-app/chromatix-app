// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { Button, ModalWindow } from 'js/components';
// import { useKeyEsc } from 'js/hooks';
import style from './modals.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ReleaseNotes = () => {
  const focusRef = useRef(null);
  const dispatch = useDispatch();

  // focus on load
  useEffect(() => {
    if (focusRef.current) {
      try {
        focusRef.current.getElementsByTagName('button')[0].focus();
      } catch (e) {
        // console.log(e);
      }
    }
  }, [focusRef]);

  // // close on escape key
  // useKeyEsc(dispatch.popupsModel.closeModal);

  return (
    <ModalWindow theme="release">
      <div className={style.title}>Version 1.0 launched</div>
      <div className={style.body}>
        <p className="color-orange font-balance">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus venenatis ligula nunc, vel maximus est
          tincidunt et. Aliquam sit amet ligula vel est dictum laoreet a in sem. Donec commodo dolor urna, eget ultrices
          odio ultricies sit amet. Nullam consequat augue eu diam malesuada, sed cursus ex rhoncus. Donec elementum odio
          sit amet sem feugiat tincidunt.
        </p>
        <p>
          Nunc eu eros nec est porta auctor in sit amet mauris. Vivamus et augue nisl. Donec tempor et lorem non semper.
          Ut sed lacinia odio. Donec laoreet venenatis sagittis. Cras fringilla lectus ac hendrerit pellentesque. Donec
          ultricies elementum volutpat. Nam molestie enim metus, non sollicitudin urna auctor viverra. Phasellus est
          odio, sagittis at dolor ac, elementum sollicitudin erat.
        </p>
      </div>

      <div ref={focusRef} className={style.buttons}>
        <Button color="orangeBtn" size="modal" spacer="" onClick={dispatch.popupsModel.closeModal}>
          Close
        </Button>
      </div>
    </ModalWindow>
  );
};

// ======================================================================
// PROPTYPES
// ======================================================================

// ReleaseNotes.propTypes = {
//   currentModalData: PropTypes.object.isRequired,
//   maturityResult: PropTypes.object,
// };

// ======================================================================
// EXPORT
// ======================================================================

export default ReleaseNotes;
