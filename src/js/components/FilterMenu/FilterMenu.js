// ======================================================================
// IMPORTS
// ======================================================================

import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';

import { Icon } from 'js/components';

import style from './FilterMenu.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const FilterMenu = ({ variant, label, icon = 'EllipsisCircleIcon', iconStrokeWidth = 1, setter, entries }) => {
  return (
    <div className={clsx(style.wrap, style['wrap' + variant])}>
      <RadixMenu.Root
      // open
      >
        <RadixMenu.Trigger className={style.trigger}>
          <span className={style.icon}>
            <Icon icon={icon} cover stroke strokeWidth={iconStrokeWidth} />
          </span>
          <span>{label}</span>
          {/* <RadixMenu.Value /> */}
        </RadixMenu.Trigger>

        <RadixMenu.Portal>
          <RadixMenu.Content side="bottom" align="start" className={clsx(style.content, style['content' + variant])}>
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
