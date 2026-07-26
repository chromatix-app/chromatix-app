// ======================================================================
// IMPORTS
// ======================================================================

import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { Icon } from 'js/components';
import style from './MenuEntries.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

// Shared entry renderer for menus built on Radix's context-menu / dropdown-menu primitives.
// Both packages expose an identical primitive surface (Item, CheckboxItem, ItemIndicator, Sub,
// SubTrigger, SubContent, Separator, Label), so the same entry schema and JSX work against either
// - the caller passes in its own `import * as RadixMenu from '@radix-ui/react-...-menu'` namespace.
//
// Entry shape (variant is required, and discriminates which fields apply):
// - action: { variant: 'action', label, icon, onSelect, to, disabled }
// - checkbox: { variant: 'checkbox', label, icon, attr, checked, disabled } - calls setter(attr, newValue)
// - submenu: { variant: 'submenu', label, icon, getEntries, emptyLabel } - getEntries is called lazily, only
//   once open; emptyLabel is shown when getEntries returns nothing (defaults to "Nothing found")
// - divider: { variant: 'divider' }
// - sectionHeading: { variant: 'sectionHeading', label }
//
// [NOTE] variant has no default on purpose - ContextMenu and ActionMenu disagree on what an
// untagged entry should mean (action vs checkbox), so a silent default previously caused
// entries meant for one to render wrong (e.g. as an empty checkbox) when reused by the other.

export const MenuEntry = ({ radixMenu, setter, totalEntries, variant, ...props }) => {
  if (variant === 'sectionHeading') {
    return <SectionHeadingEntry radixMenu={radixMenu} {...props} />;
  } else if (variant === 'divider') {
    return <DividerEntry radixMenu={radixMenu} />;
  } else if (variant === 'submenu') {
    return <SubmenuEntry radixMenu={radixMenu} {...props} />;
  } else if (variant === 'checkbox') {
    return <CheckboxEntry radixMenu={radixMenu} setter={setter} totalEntries={totalEntries} {...props} />;
  } else if (variant === 'action') {
    return <ActionEntry radixMenu={radixMenu} {...props} />;
  } else if (import.meta.env.PROD) {
    console.error(`MenuEntry: unknown or missing variant "${variant}" for entry`, props);
    return null;
  } else {
    throw new Error(`MenuEntry: unknown or missing variant "${variant}" for entry`);
  }
};

const SectionHeadingEntry = ({ radixMenu: RadixMenu, label }) => {
  return (
    <RadixMenu.Label className={style.sectionHeading}>
      <span>{label}</span>
    </RadixMenu.Label>
  );
};

const DividerEntry = ({ radixMenu: RadixMenu }) => {
  return <RadixMenu.Separator className={style.divider} />;
};

const EntryInner = ({ icon, label }) => (
  <>
    {icon && (
      <span className={style.entryIcon}>
        <Icon icon={icon} cover stroke />
      </span>
    )}
    {label}
  </>
);

const ActionEntry = ({ radixMenu: RadixMenu, label, onSelect, disabled, to, icon }) => {
  const inner = <EntryInner icon={icon} label={label} />;
  if (to) {
    return (
      <RadixMenu.Item className={style.actionItem} disabled={disabled} asChild>
        <NavLink to={to}>{inner}</NavLink>
      </RadixMenu.Item>
    );
  }
  return (
    <RadixMenu.Item className={style.actionItem} onSelect={onSelect} disabled={disabled}>
      {inner}
    </RadixMenu.Item>
  );
};

const CheckboxEntry = ({ radixMenu: RadixMenu, label, setter, totalEntries, ...entry }) => {
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

const SubmenuEntry = ({ radixMenu: RadixMenu, label, getEntries, emptyLabel, icon }) => {
  return (
    <RadixMenu.Sub>
      <RadixMenu.SubTrigger className={style.subTrigger}>
        <span className={style.subTriggerLeft}>
          <EntryInner icon={icon} label={label} />
        </span>
        <span className={style.subTriggerArrow}>
          <Icon icon="ArrowRightIcon" cover stroke />
        </span>
      </RadixMenu.SubTrigger>
      <RadixMenu.Portal>
        <RadixMenu.SubContent className={style.content} collisionPadding={8}>
          <SubmenuContent radixMenu={RadixMenu} getEntries={getEntries} emptyLabel={emptyLabel} />
        </RadixMenu.SubContent>
      </RadixMenu.Portal>
    </RadixMenu.Sub>
  );
};

// Separate component so it only mounts (and calls getEntries) when the submenu is actually open
const SubmenuContent = ({ radixMenu: RadixMenu, getEntries, emptyLabel = 'Nothing found' }) => {
  const entries = getEntries();
  if (!entries?.length) {
    return <RadixMenu.Label className={style.actionItemNull}>{emptyLabel}</RadixMenu.Label>;
  }
  return entries.map((entry, index) => <MenuEntry key={index} radixMenu={RadixMenu} {...entry} />);
};

// ======================================================================
// EXPORT
// ======================================================================

export default MenuEntry;
