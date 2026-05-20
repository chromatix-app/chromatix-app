// ======================================================================
// IMPORTS
// ======================================================================

import { OTPInput } from 'input-otp';

import style from './FormOTP.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const FormOTP = ({ value, onChange, length = 4, autoFocus }) => {
  return (
    <OTPInput
      maxLength={length}
      value={value}
      onChange={onChange}
      autoFocus={autoFocus}
      render={({ slots }) => (
        <div className={style.container}>
          {slots.map((slot, idx) => (
            <div key={idx} className={style.slot} data-active={slot.isActive}>
              {slot.char !== null ? '*' : null}
              {slot.hasFakeCaret && <div className={style.caret} />}
            </div>
          ))}
        </div>
      )}
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default FormOTP;
