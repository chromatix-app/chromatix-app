// ======================================================================
// IMPORTS
// ======================================================================

import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';

import { Icon } from 'js/components';

import style from './PopoverMenu.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const PopoverMenu = ({ children, variant, setter, entries, side = 'top', align = 'end' }) => {
  const hasGroups = entries.find((entry) => entry.variant === 'sectionHeading');

  return (
    <RadixMenu.Root
    // open
    >
      <RadixMenu.Trigger>{children}</RadixMenu.Trigger>

      <RadixMenu.Portal>
        <RadixMenu.Content
          side={side}
          align={align}
          className={clsx(style.content, style['content' + variant], {
            [style.contentWithGroups]: hasGroups,
          })}
        >
          {entries.map((entry, index) => (
            <MenuEntry key={index} setter={setter} totalEntries={entries?.length} {...entry} />
          ))}
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  );
};

const MenuEntry = ({ variant = 'checkbox', ...props }) => {
  if (variant === 'sectionHeading') {
    return <SectionHeadingEntry {...props} />;
  } else if (variant === 'divider') {
    return <DividerEntry {...props} />;
  } else if (variant === 'checkbox') {
    return <CheckboxEntry {...props} />;
  }
};

const SectionHeadingEntry = ({ label }) => {
  return (
    <RadixMenu.Label className={style.sectionHeading}>
      <span>{label}</span>
    </RadixMenu.Label>
  );
};

const DividerEntry = ({ ...entry }) => {
  return <RadixMenu.Separator className={style.divider} />;
};

const CheckboxEntry = ({ label, setter, totalEntries, ...entry }) => {
  const handleCheckedChange = (newValue) => {
    setter(entry.attr, newValue);
  };

  // Prevent menu closing when clicking an item
  const handleSelect = (event) => {
    if (totalEntries && totalEntries > 1) {
      event.preventDefault();
    }
  };

  return (
    <RadixMenu.CheckboxItem
      className={style.checkboxItem}
      onCheckedChange={handleCheckedChange}
      onSelect={handleSelect}
      {...entry}
    >
      <RadixMenu.ItemIndicator>
        <span className={style.checkboxIcon}>
          <Icon icon="CheckSquareFilledIcon" cover />
        </span>
      </RadixMenu.ItemIndicator>

      {/* Render unchecked icon when item is not checked */}
      {!entry.checked && (
        <span className={clsx(style.checkboxIcon, style.checkboxIconInactive)}>
          <Icon icon="CheckSquareEmptyIcon" cover stroke />
        </span>
      )}

      <span>{label}</span>
    </RadixMenu.CheckboxItem>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PopoverMenu;
