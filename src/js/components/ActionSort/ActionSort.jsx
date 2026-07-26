// ======================================================================
// IMPORTS
// ======================================================================

import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';

import { Icon } from 'js/components';
import menuEntriesStyle from 'js/components/MenuEntries/MenuEntries.module.scss';

import style from './ActionSort.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const ActionSort = ({ variant, sortValue, orderValue, options, setSort, setOrder }) => {
  const orderIcon = orderValue === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon';
  const valueLabel = options.find((option) => option.value === sortValue)?.label;

  const handleSelect = (event, itemValue) => {
    // Keep the menu open so direction can keep being toggled without reopening it
    event.preventDefault();

    if (itemValue === sortValue) {
      setOrder(orderValue === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(itemValue, 'asc');
    }
  };

  return (
    <div className={clsx(style.wrap, style['wrap' + variant])}>
      <RadixMenu.Root>
        <RadixMenu.Trigger className={style.trigger} aria-label={valueLabel}>
          <span className={style.icon}>
            <Icon icon={orderIcon} cover stroke />
          </span>
          <span className={style.label}>{valueLabel}</span>
        </RadixMenu.Trigger>

        <RadixMenu.Portal>
          <RadixMenu.Content
            side="bottom"
            align="start"
            className={clsx(menuEntriesStyle.content, style.content, style['content' + variant])}
          >
            {options.map((option) => (
              <RadixMenu.Item
                key={option.value}
                className={clsx(style.actionItem, menuEntriesStyle.actionItem)}
                onSelect={(event) => handleSelect(event, option.value)}
              >
                <span className={clsx(style.entryIcon, option.value !== sortValue && style.entryIconHidden)}>
                  <Icon icon={orderIcon} cover stroke />
                </span>
                {option.label}
              </RadixMenu.Item>
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

export default ActionSort;
