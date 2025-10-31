// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import semver from 'semver';

import { Icon } from 'js/components';
import { getEnvironment, sendToElectron } from 'js/utils';

import style from './ElectronUI.module.scss';

// ======================================================================
// OPTIONS
// ======================================================================

const ignoredTopItems = ['Chromatix', 'File', 'Edit', 'History', 'Developer', 'Help'];
const ignoredNestedItems = ['about', 'hide', 'hideOthers', 'unhide', 'quit', 'services', 'window'];

const envData = getEnvironment();

// ======================================================================
// COMPONENT
// ======================================================================

const ElectronUI = () => {
  const electronMenu = useSelector(({ appModel }) => appModel.electronMenu);

  const displayMenu = envData.electronVersion && semver.gte(envData.electronVersion, '0.3.1');

  return (
    <>
      <div className="electron-drag"></div>
      {electronMenu && displayMenu && <ElectronMenu electronMenu={electronMenu} />}
    </>
  );
};

const ElectronMenu = ({ electronMenu }) => {
  // console.log(electronMenu);

  const filteredMenu = electronMenu.filter(
    (item) => !ignoredTopItems.includes(item.label) && !ignoredTopItems.includes(item.role)
  );

  const handleClick = (_event, item) => {
    // if (event.preventDefault) {
    //   event.preventDefault();
    // }
    const buttonAction = stringToButtonAction(item.label ? item.label : item.role);
    sendToElectron('any', buttonAction, null);
  };

  const renderAllMenuItems = () => {
    const allItems = [];

    filteredMenu.forEach((topItem, topIndex) => {
      // Top menu items
      allItems.push(
        <RadixMenu.Label key={`header-${topIndex}`} className={style.sectionHeading}>
          {topItem.label ? topItem.label : topItem.role}
        </RadixMenu.Label>
      );

      // Submenu items
      if (topItem.submenu) {
        topItem.submenu
          .filter(
            (subItem) =>
              subItem?.type !== 'separator' &&
              !ignoredNestedItems.includes(subItem.label) &&
              !ignoredNestedItems.includes(subItem.role)
          )
          .forEach((subItem, subIndex) => {
            const isLabel = subItem.label && !subItem.role && !subItem.type;
            const isCheckbox = subItem.type === 'checkbox';

            // Label items
            if (isLabel) {
              allItems.push(
                <RadixMenu.Label key={`${topIndex}-${subIndex}`} className={style.label}>
                  {subItem.label ? subItem.label : subItem.role}
                </RadixMenu.Label>
              );
            }

            // Checkbox items
            else if (isCheckbox) {
              allItems.push(
                <RadixMenu.CheckboxItem
                  key={`${topIndex}-${subIndex}`}
                  className={style.checkboxItem}
                  checked={subItem.checked}
                  onCheckedChange={(event) => handleClick(event, subItem)}
                >
                  <div>{stringToLabel(subItem.label ? subItem.label : subItem.role)}</div>
                  <RadixMenu.ItemIndicator>
                    <span className={style.checkboxIcon}>
                      <Icon icon="CheckSquareFilledIcon" cover />
                    </span>
                  </RadixMenu.ItemIndicator>
                </RadixMenu.CheckboxItem>
              );
            }

            // Button items
            else {
              allItems.push(
                <RadixMenu.Item
                  key={`${topIndex}-${subIndex}`}
                  className={style.item}
                  onSelect={(event) => handleClick(event, subItem)}
                >
                  {stringToLabel(subItem.label ? subItem.label : subItem.role)}
                </RadixMenu.Item>
              );
            }
          });
      }

      // Separator between sections (except for the last one)
      if (topIndex < filteredMenu.length - 1) {
        allItems.push(<RadixMenu.Separator key={`separator-${topIndex}`} className={style.separator} />);
      }
    });

    return allItems;
  };

  return (
    <div className={style.menu}>
      <RadixMenu.Root>
        <RadixMenu.Trigger className={style.trigger}>
          <span className="u-hide-text">Menu</span>
          <span className={style.line1}></span>
          <span className={style.line2}></span>
          <span className={style.line3}></span>
        </RadixMenu.Trigger>
        <RadixMenu.Portal>
          <RadixMenu.Content side="bottom" align="start" className={style.content}>
            {renderAllMenuItems()}
          </RadixMenu.Content>
        </RadixMenu.Portal>
      </RadixMenu.Root>
    </div>
  );
};

// HELPERS

const manuallyReplaceLabels = {
  togglefullscreen: 'Toggle Full Screen',
};

const stringToLabel = (str) => {
  // check for manual replacements
  if (manuallyReplaceLabels[str.toLowerCase()]) {
    return manuallyReplaceLabels[str.toLowerCase()];
  }
  // convert camel case to spaces
  str = str.replace(/([a-z])([A-Z])/g, '$1 $2');
  // capitalise words
  str = str.replace(/\b\w/g, (char) => char.toUpperCase());
  return str;
};

const stringToButtonAction = (str) => {
  // remove anything in brackets
  str = str.replace(/\(.*?\)/g, '').trim();
  // convert camel case to kebab case
  str = str.replace(/([a-z])([A-Z])/g, '$1-$2');
  // convert a string to kebab case
  return str
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .toLowerCase(); // convert to lowercase
};

// ======================================================================
// EXPORT
// ======================================================================

export default ElectronUI;
