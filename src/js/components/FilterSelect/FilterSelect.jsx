// ======================================================================
// IMPORTS
// ======================================================================

import { forwardRef } from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import clsx from 'clsx';

import { Icon } from 'js/components';

import style from './FilterSelect.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const FilterSelect = ({ variant, value, options, setter, icon = 'ArrowsVerticalIcon' }) => {
  const handleValueChange = (newValue) => {
    setter(newValue);
  };

  return (
    <div className={clsx(style.wrap, style['wrap' + variant])}>
      <RadixSelect.Root
        value={value}
        onValueChange={handleValueChange}
        // open
      >
        <RadixSelect.Trigger className={style.trigger}>
          <span className={style.icon}>
            <Icon icon={icon} cover stroke />
          </span>
          <span className={style.value}>
            <RadixSelect.Value />
          </span>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content position="popper" className={clsx(style.content, style['content' + variant])}>
            <RadixSelect.Viewport className={style.viewport}>
              {options.map((option) => (
                <SelectEntry key={option.value} value={option.value}>
                  {option.label}
                </SelectEntry>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
};

const SelectEntry = forwardRef(({ children, ...entry }, forwardedRef) => {
  return (
    <RadixSelect.Item className={style.selectItem} {...entry} ref={forwardedRef}>
      <RadixSelect.ItemIndicator className={style.selectIndicator}>
        <span className={style.selectIcon}>
          <Icon icon="CheckCircleEmptyIcon" cover stroke />
          <span className={clsx(style.selectIcon, style.selectIconMiddle)}>
            <Icon icon="CheckCircleMiddleIcon" cover />
          </span>
        </span>
      </RadixSelect.ItemIndicator>

      {/* Render unchecked icon when item is not checked */}
      <span className={clsx(style.selectIcon, style.selectIconInactive)}>
        <Icon icon="CheckCircleEmptyIcon" cover stroke />
      </span>

      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
});

// ======================================================================
// EXPORT
// ======================================================================

export default FilterSelect;
