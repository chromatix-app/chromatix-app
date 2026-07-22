// ======================================================================
// IMPORTS
// ======================================================================

import * as RadixMenu from '@radix-ui/react-context-menu';
import { NavLink } from 'react-router-dom';

import { Icon } from 'js/components';
import style from './ContextMenu.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const ContextMenu = ({ children, entries }) => {
  if (!entries?.length) {
    return children;
  }

  return (
    <RadixMenu.Root>
      <RadixMenu.Trigger asChild>{children}</RadixMenu.Trigger>

      <RadixMenu.Portal>
        <RadixMenu.Content className={style.content} collisionPadding={12}>
          {entries.map((entry, index) => (
            <MenuEntry key={index} {...entry} />
          ))}
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  );
};

const MenuEntry = ({ variant = 'action', ...props }) => {
  if (variant === 'sectionHeading') {
    return <SectionHeadingEntry {...props} />;
  } else if (variant === 'divider') {
    return <DividerEntry />;
  } else if (variant === 'submenu') {
    return <SubmenuEntry {...props} />;
  } else {
    return <ActionEntry {...props} />;
  }
};

const SectionHeadingEntry = ({ label }) => {
  return (
    <RadixMenu.Label className={style.sectionHeading}>
      <span>{label}</span>
    </RadixMenu.Label>
  );
};

const DividerEntry = () => {
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

const ActionEntry = ({ label, onSelect, disabled, to, icon }) => {
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

const SubmenuEntry = ({ label, getEntries, icon }) => {
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
          <SubmenuContent getEntries={getEntries} />
        </RadixMenu.SubContent>
      </RadixMenu.Portal>
    </RadixMenu.Sub>
  );
};

// Separate component so it only mounts (and calls getEntries) when the submenu is actually open
const SubmenuContent = ({ getEntries }) => {
  const entries = getEntries();
  if (!entries?.length) {
    return <RadixMenu.Label className={style.actionItemNull}>No playlists found</RadixMenu.Label>;
  }
  return entries.map((entry, index) => <MenuEntry key={index} {...entry} />);
};

// ======================================================================
// EXPORT
// ======================================================================

export default ContextMenu;
