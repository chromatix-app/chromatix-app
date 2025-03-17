// ======================================================================
// IMPORTS
// ======================================================================

import { forwardRef } from 'react';
import * as RadixSelect from '@radix-ui/react-select';

import { Icon } from 'js/components';

import style from './FilterSelect.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const FilterSelect = ({ value, options, setter, icon = 'ArrowsVerticalIcon' }) => {
  const handleValueChange = (newValue) => {
    setter(newValue);
  };

  return (
    <div className={style.wrap}>
      <RadixSelect.Root
        value={value}
        onValueChange={handleValueChange}
        // open
      >
        <RadixSelect.Trigger className={style.trigger}>
          <span className={style.icon}>
            <Icon icon={icon} cover stroke />
          </span>
          <RadixSelect.Value />
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content position="popper" className={style.content}>
            <RadixSelect.Viewport className={style.viewport}>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
};

const SelectItem = forwardRef(({ children, ...props }, forwardedRef) => {
  return (
    <RadixSelect.Item className={style.item} {...props} ref={forwardedRef}>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className={style.indicator}>
        <span className={style.indicatorIcon}>
          <Icon icon="CheckIcon" cover stroke />
        </span>
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
});

// ======================================================================
// EXPORT
// ======================================================================

export default FilterSelect;
