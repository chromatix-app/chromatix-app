// ======================================================================
// IMPORTS
// ======================================================================

import * as RadixMenu from '@radix-ui/react-context-menu';
import clsx from 'clsx';

import { MenuEntry } from 'js/components';
import menuEntriesStyle from 'js/components/MenuEntries/MenuEntries.module.scss';
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
        <RadixMenu.Content className={clsx(menuEntriesStyle.content, style.content)} collisionPadding={12}>
          {entries.map((entry, index) => (
            <MenuEntry key={index} radixMenu={RadixMenu} {...entry} />
          ))}
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ContextMenu;
