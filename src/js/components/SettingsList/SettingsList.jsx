// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';
import clsx from 'clsx';

import { FormTabGroup, Icon, RangeSlider } from 'js/components';

import style from './SettingsList.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const SettingsList = ({ title, description, menuItems, padding, variant }) => {
  const dispatch = useDispatch();

  return (
    <div
      className={clsx(
        style.group,
        variant && style[variant],
        'settingsGroup',
        padding === false && 'settingsGroupNoPadding'
      )}
    >
      {title && <div className={style.title}>{title}</div>}

      {description && <div className={style.topDescription}>{description}</div>}

      {menuItems && menuItems.length > 0 && (
        <div className={style.list}>
          {menuItems.map(
            ({ type = 'checkbox', key, label, description, footnote, state, disabled, props, options }, index) => {
              if (type === 'spacer') {
                return <div key={index} className={style.spacer} />;
              } else if (type === 'label') {
                return (
                  <div key={index} className={style.listEntry}>
                    {label && <div className={clsx(style.label, disabled && style.disabled)}>{label}</div>}
                    {description && (
                      <div className={clsx(style.description, disabled && style.disabled)}>{description}</div>
                    )}
                    {footnote && <div className={clsx(style.footnote, disabled && style.disabled)}>{footnote}</div>}
                  </div>
                );
              } else if (type === 'checkbox') {
                return (
                  <div key={index} className={style.listEntry} data-focus-outline>
                    <label className={style.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={state}
                        onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
                        disabled={disabled}
                      />
                      <span aria-hidden="true" className={style.checkboxIndicator}>
                        {state && <Icon icon="CheckIcon" cover stroke strokeWidth={2} />}
                      </span>
                      <div>
                        {label && <div className={clsx(style.label, disabled && style.disabled)}>{label}</div>}
                        {description && (
                          <div className={clsx(style.description, disabled && style.disabled)}>{description}</div>
                        )}
                        {footnote && <div className={clsx(style.footnote, disabled && style.disabled)}>{footnote}</div>}
                      </div>
                    </label>
                  </div>
                );
              } else if (type === 'range') {
                return (
                  <div key={index} className={style.listEntry}>
                    <div>
                      <label htmlFor={`setting-${key}`} className={clsx(style.label, disabled && style.disabled)}>
                        {label}
                      </label>
                      {description && (
                        <div className={clsx(style.description, disabled && style.disabled)}>{description}</div>
                      )}
                      {footnote && <div className={clsx(style.footnote, disabled && style.disabled)}>{footnote}</div>}
                      <div className={style.range}>
                        <RangeSlider id={`setting-${key}`} value={state} isDisabled={disabled} {...props} />
                      </div>
                    </div>
                  </div>
                );
              } else if (type === 'text') {
                return (
                  <div key={index} className={style.listEntry}>
                    <div>
                      <label htmlFor={`setting-${key}`} className={clsx(style.label, disabled && style.disabled)}>
                        {label}
                      </label>
                      {description && (
                        <div className={clsx(style.description, disabled && style.disabled)}>{description}</div>
                      )}
                      {footnote && <div className={clsx(style.footnote, disabled && style.disabled)}>{footnote}</div>}
                      <input
                        id={`setting-${key}`}
                        type="text"
                        className={style.textInput}
                        value={state || ''}
                        disabled={disabled}
                        placeholder={props?.placeholder}
                        onChange={(event) => dispatch.sessionModel.setSessionState({ [key]: event.target.value })}
                      />
                      {props?.error && <div className={style.inputErrorMessage}>{props.error}</div>}
                    </div>
                  </div>
                );
              } else if (type === 'radio') {
                return (
                  <fieldset key={index} className={clsx(style.listEntry, style.radioFieldset)}>
                    {label && <legend className={clsx(style.label, disabled && style.disabled)}>{label}</legend>}
                    {description && (
                      <div className={clsx(style.description, disabled && style.disabled)}>{description}</div>
                    )}
                    {footnote && <div className={clsx(style.footnote, disabled && style.disabled)}>{footnote}</div>}
                    <div className={style.radioGroup}>
                      {options?.map(({ label: optionLabel, value: optionValue, disabled: optionDisabled }) => (
                        <div key={optionValue} className={style.radioOption} data-focus-outline>
                          <label>
                            <input
                              type="radio"
                              name={key}
                              checked={state === optionValue}
                              onChange={() => dispatch.sessionModel.setSessionState({ [key]: optionValue })}
                              disabled={disabled || optionDisabled}
                            />
                            <span className={clsx(style.label, (disabled || optionDisabled) && style.disabled)}>
                              {optionLabel}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                );
              } else if (type === 'tabGroup') {
                return (
                  <div key={index} className={style.listEntry}>
                    <div>
                      {label && <div className={clsx(style.label, disabled && style.disabled)}>{label}</div>}
                      {description && (
                        <div className={clsx(style.description, disabled && style.disabled)}>{description}</div>
                      )}
                      {footnote && <div className={clsx(style.footnote, disabled && style.disabled)}>{footnote}</div>}
                      <FormTabGroup
                        name={label || key}
                        value={state}
                        onChange={(val) => dispatch.sessionModel.setSessionState({ [key]: val })}
                        options={options}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                );
              } else {
                return null;
              }
            }
          )}
        </div>
      )}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsList;
