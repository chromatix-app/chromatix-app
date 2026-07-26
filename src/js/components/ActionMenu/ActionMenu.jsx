// ======================================================================
// IMPORTS
// ======================================================================

import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';

import { Icon, MenuEntry } from 'js/components';
import menuEntriesStyle from 'js/components/MenuEntries/MenuEntries.module.scss';

import style from './ActionMenu.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const ActionMenu = ({ variant, label, icon = 'EllipsisCircleIcon', iconStrokeWidth = 1, setter, entries }) => {
  const hasGroups = entries.find((entry) => entry.variant === 'sectionHeading');

  return (
    <div className={clsx(style.wrap, style['wrap' + variant])}>
      <RadixMenu.Root>
        <RadixMenu.Trigger className={style.trigger} aria-label={label}>
          <span className={style.icon}>
            <Icon icon={icon} cover stroke strokeWidth={iconStrokeWidth} />
          </span>
          <span className={style.label}>{label}</span>
        </RadixMenu.Trigger>

        <RadixMenu.Portal>
          <RadixMenu.Content
            side="bottom"
            align="start"
            className={clsx(menuEntriesStyle.content, style.content, style['content' + variant], {
              [style.contentWithGroups]: hasGroups,
            })}
          >
            {entries.map((entry, index) => (
              <MenuEntry key={index} radixMenu={RadixMenu} setter={setter} totalEntries={entries?.length} {...entry} />
            ))}
          </RadixMenu.Content>
        </RadixMenu.Portal>
      </RadixMenu.Root>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ActionMenu;
