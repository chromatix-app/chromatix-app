// ======================================================================
// IMPORTS
// ======================================================================

import { forwardRef } from 'react';
import * as RadixSelect from '@radix-ui/react-select';

import { Icon } from 'js/components';

import style from './FormSelect.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const FormSelect = ({ id, value, onChange, options, placeholder, disabled }) => {
  const activeLabel = options?.find((option) => option.value === value)?.label;

  return (
    <RadixSelect.Root value={value} onValueChange={onChange} disabled={disabled}>
      <RadixSelect.Trigger id={id} className={style.trigger}>
        <span className={style.triggerLabel}>{activeLabel || placeholder}</span>
        <span className={style.triggerChevron}>
          <Icon icon="ArrowDownIcon" cover stroke strokeWidth={1.5} />
        </span>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content position="popper" sideOffset={4} className={style.content}>
          <RadixSelect.Viewport className={style.viewport}>
            {options?.map(({ value: optionValue, label, disabled: optionDisabled }) => (
              <SelectItem key={optionValue} value={optionValue} disabled={optionDisabled}>
                {label}
              </SelectItem>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

const SelectItem = forwardRef(({ children, ...props }, ref) => {
  return (
    <RadixSelect.Item className={style.item} ref={ref} {...props}>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className={style.itemIndicator}>
        <Icon icon="CheckCircleFilledIcon" cover />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
});

// ======================================================================
// EXPORT
// ======================================================================

export default FormSelect;
