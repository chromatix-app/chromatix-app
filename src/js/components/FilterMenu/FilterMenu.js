// ======================================================================
// IMPORTS
// ======================================================================

// import { forwardRef } from 'react';
import * as RadixMenu from '@radix-ui/react-dropdown-menu';

import { Icon } from 'js/components';

import style from './FilterMenu.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const FilterMenu = ({ label, icon = 'EllipsisCircleIcon', setter, entries }) => {
  return (
    <div className={style.wrap}>
      <RadixMenu.Root
      // open
      >
        <RadixMenu.Trigger className={style.trigger}>
          <span className={style.icon}>
            <Icon icon={icon} cover stroke />
          </span>
          <span>{label}</span>
          {/* <RadixMenu.Value /> */}
        </RadixMenu.Trigger>

        <RadixMenu.Portal>
          <RadixMenu.Content side="bottom" align="start" className={style.content}>
            {entries.map((entry, index) => (
              <MenuEntry key={index} setter={setter} {...entry} />
            ))}
          </RadixMenu.Content>
        </RadixMenu.Portal>
      </RadixMenu.Root>
    </div>
  );
};

const MenuEntry = ({ label, setter, ...entry }) => {
  const handleCheckedChange = (newValue) => {
    setter(entry.attr, newValue);
  };

  // Prevent menu closing when clicking an item
  const handleSelect = (event) => {
    event.preventDefault();
  };

  return (
    <RadixMenu.CheckboxItem
      className={style.item}
      onCheckedChange={handleCheckedChange}
      onSelect={handleSelect}
      {...entry}
    >
      <span>{label}</span>
      <RadixMenu.ItemIndicator className={style.indicator}>
        <span className={style.indicatorIcon}>
          <Icon icon="CheckIcon" cover stroke />
        </span>
      </RadixMenu.ItemIndicator>
    </RadixMenu.CheckboxItem>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default FilterMenu;
