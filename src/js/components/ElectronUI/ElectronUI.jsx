// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
// import clsx from 'clsx';

import { sendToElectron } from 'js/utils';

import style from './ElectronUI.module.scss';

// ======================================================================
// OPTIONS
// ======================================================================

const ignoredTopItems = ['Chromatix', 'File', 'Edit', 'History', 'Developer', 'Help'];
const ignoredNestedItems = ['services', 'window'];

// ======================================================================
// COMPONENT
// ======================================================================

const ElectronUI = () => {
  const electronMenu = useSelector(({ appModel }) => appModel.electronMenu);

  return (
    <>
      <div className="electron-drag"></div>
      {electronMenu && <ElectronMenu electronMenu={electronMenu} />}
    </>
  );
};

const ElectronMenu = ({ electronMenu }) => {
  // console.log(electronMenu);

  const finalMenu = electronMenu.filter(
    (item) => !ignoredTopItems.includes(item.label) && !ignoredTopItems.includes(item.role)
  );

  const handleClick = (buttonAction) => {
    sendToElectron('any', buttonAction, null);
  };

  return (
    <div className={style.menu}>
      <ul>
        {finalMenu.map((item, index) => (
          <li key={index}>
            {item.label ? item.label : item.role}
            {item.submenu && (
              <ul>
                {item.submenu
                  .filter(
                    (subItem) =>
                      subItem?.type !== 'separator' &&
                      !ignoredNestedItems.includes(subItem.label) &&
                      !ignoredNestedItems.includes(subItem.role)
                  )
                  .map((subItem, subIndex) => {
                    const isLabel = subItem.label && !subItem.role && !subItem.type;
                    const buttonAction = stringToButtonAction(subItem.label ? subItem.label : subItem.role);
                    return (
                      <li key={subIndex}>
                        {isLabel && (subItem.label ? subItem.label : subItem.role)}
                        {!isLabel && (
                          <button onClick={() => handleClick(buttonAction)}>
                            {subItem.label ? subItem.label : subItem.role}
                          </button>
                        )}
                      </li>
                    );
                  })}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// HELPERS

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
