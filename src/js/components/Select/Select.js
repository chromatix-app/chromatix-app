// ======================================================================
// IMPORTS
// ======================================================================

import { forwardRef, useState } from 'react';
import * as RadixSelect from '@radix-ui/react-select';

import { Icon } from 'js/components';

import style from './Select.module.scss';

// ======================================================================
// RENDER
// ======================================================================

export const Select = () => {
  const [value, setValue] = useState('alphabetical');

  const options = [
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'rating', label: 'Rating' },
    { value: 'recentlyAdded', label: 'Recently Added' },
    { value: 'recentlyPlayed', label: 'Recently Played' },
  ];

  const handleValueChange = (newValue) => {
    setValue(newValue);
  };

  return (
    <div className={style.wrap}>
      <RadixSelect.Root value={value} onValueChange={handleValueChange}>
        <RadixSelect.Trigger className={style.trigger} aria-label="Food">
          <span className={style.icon}>
            <Icon icon="ServerIcon" cover stroke />
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

const SelectItem = forwardRef(({ children, className, ...props }, forwardedRef) => {
  return (
    <RadixSelect.Item className={style.item} {...props} ref={forwardedRef}>
      <RadixSelect.ItemIndicator className={style.indicator}>&gt;</RadixSelect.ItemIndicator>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
});

// ======================================================================
// EXPORT
// ======================================================================

export default Select;
