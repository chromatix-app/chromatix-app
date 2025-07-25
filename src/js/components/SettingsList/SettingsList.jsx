// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';
import clsx from 'clsx';

import { RangeSlider } from 'js/components';

import style from './SettingsList.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const SettingsList = ({ title, menuItems }) => {
  const dispatch = useDispatch();

  return (
    <div className={style.group}>
      {title && <div className={style.title}>{title}</div>}

      <div className={style.list}>
        {menuItems.map(({ type = 'checkbox', key, label, description, state, disabled, props }, index) => {
          if (type === 'spacer') {
            return <div key={index} className={style.spacer} />;
          } else if (type === 'checkbox') {
            return (
              <div key={index} className={style.listEntry}>
                <label>
                  <input
                    type="checkbox"
                    checked={state}
                    onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
                    disabled={disabled}
                  />
                  <div>
                    {label && <div className={clsx(style.label, disabled && style.disabled)}>{label}</div>}
                    {description && (
                      <div className={clsx(style.description, disabled && style.disabled)}>{description}</div>
                    )}
                  </div>
                </label>
              </div>
            );
          } else if (type === 'range') {
            return (
              <div key={index} className={style.listEntry}>
                <label>
                  <div>
                    <div className={clsx(style.label, disabled && style.disabled)}>Scrollbar width</div>
                    <div className={style.range}>
                      <RangeSlider value={state} isDisabled={disabled} {...props} />
                    </div>
                  </div>
                </label>
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsList;
