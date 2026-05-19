// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';
import clsx from 'clsx';

import { FormTabGroup, RangeSlider } from 'js/components';

import style from './SettingsList.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const SettingsList = ({ title, description, menuItems }) => {
  const dispatch = useDispatch();

  return (
    <div className="settingsGroup">
      {title && <div className={style.title}>{title}</div>}

      {description && <div className={style.topDescription}>{description}</div>}

      <div className={style.list}>
        {menuItems.map(({ type = 'checkbox', key, label, description, state, disabled, props, options }, index) => {
          if (type === 'spacer') {
            return <div key={index} className={style.spacer} />;
          } else if (type === 'checkbox') {
            return (
              <div key={index} className={style.listEntry} data-focus-outline>
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
          } else if (type === 'radio') {
            return (
              <div key={index} className={style.listEntry}>
                <div>
                  {label && <div className={clsx(style.label, disabled && style.disabled)}>{label}</div>}
                  {description && (
                    <div className={clsx(style.description, disabled && style.disabled)}>{description}</div>
                  )}

                  <FormTabGroup
                    name={key}
                    value={state}
                    onChange={(val) => dispatch.sessionModel.setSessionState({ [key]: val })}
                    options={options}
                    disabled={disabled}
                  />

                  {/* <div className={style.radioGroup}>
                    {options?.map(({ label: optionLabel, value }) => (
                      <label key={value} className={style.radioOption}>
                        <input
                          type="radio"
                          name={key}
                          checked={state === value}
                          onChange={() => dispatch.sessionModel.setSessionState({ [key]: value })}
                          disabled={disabled}
                        />
                        <span className={clsx(style.label, disabled && style.disabled)}>{optionLabel}</span>
                      </label>
                    ))}
                  </div> */}
                </div>
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
          } else if (type === 'label') {
            return (
              <div key={index} className={style.listEntry}>
                {label && <div className={clsx(style.label, disabled && style.disabled)}>{label}</div>}
                {description && (
                  <div className={clsx(style.description, disabled && style.disabled)}>{description}</div>
                )}
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
