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

export const PopoverMenu = ({
  children,
  variant,
  appearance = 'secondary',
  setter,
  entries,
  side = 'top',
  align = 'start',
  top = 0,
  left = 0,
}) => {
  const hasGroups = entries.find((entry) => entry.variant === 'sectionHeading');

  const appearanceClass = appearance ? 'content' + appearance.charAt(0).toUpperCase() + appearance.slice(1) : '';
  const variantClass = variant ? 'content' + variant.charAt(0).toUpperCase() + variant.slice(1) : '';

  return (
    <RadixMenu.Root
    // open
    >
      <RadixMenu.Trigger>{children}</RadixMenu.Trigger>

      <RadixMenu.Portal>
        <RadixMenu.Content
          side={side}
          align={align}
          onEscapeKeyDown={handleEscapeKeyDown}
          className={clsx(style.content, style[appearanceClass], style[variantClass], {
            [style.contentWithGroups]: hasGroups,
          })}
          style={{
            top: top + 'px',
            left: left + 'px',
          }}
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
// HELPERS
// ======================================================================

// Prevent custom escape handling from running
const handleEscapeKeyDown = (event) => {
  event.stopPropagation();
};

// ======================================================================
// EXPORT
// ======================================================================

export default PopoverMenu;
