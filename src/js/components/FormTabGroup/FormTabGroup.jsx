// ======================================================================
// IMPORTS
// ======================================================================

import * as ToggleGroup from '@radix-ui/react-toggle-group';
import clsx from 'clsx';

import style from './FormTabGroup.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const FormTabGroup = ({ name, value, onChange, options, disabled }) => {
  return (
    <ToggleGroup.Root
      type="single"
      aria-label={name}
      value={value}
      onValueChange={(val) => {
        // Radix calls onValueChange with '' if the active item is clicked again; ignore that
        if (val) onChange(val);
      }}
      className={style.buttons}
    >
      {options?.map(({ label, value: optionValue, disabled: optionDisabled, icon }) => (
        <ToggleGroup.Item
          key={optionValue}
          value={optionValue}
          disabled={disabled || optionDisabled}
          className={clsx(style.item, {
            [style.itemActive]: value === optionValue,
          })}
          style={{ zIndex: value === optionValue ? 2 : 'initial' }}
        >
          {icon && <span className={style.icon}>{icon}</span>}
          {label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default FormTabGroup;
