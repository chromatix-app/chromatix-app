// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import style from './SettingsAccessibility.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsAccessibility = () => {
  return (
    <div className={style.wrap}>
      <div className={style.group}>
        <div className={style.title}>Interface</div>
        <InterfaceSettings />
      </div>
    </div>
  );
};

//
// INTERFACE
//

const InterfaceSettings = () => {
  const dispatch = useDispatch();

  const { accessibilityFocus } = useSelector(({ sessionModel }) => sessionModel);

  const menuItems = [
    {
      key: 'accessibilityFocus',
      label: 'Highlight focused elements',
      description:
        'When enabled, elements such as buttons, links, and form controls are highlighted when focused. For example, when using the keyboard to navigate the interface.',
      state: accessibilityFocus,
    },
  ];

  return (
    <div className={style.menu}>
      {menuItems.map(({ key, label, description, state }) => (
        <div key={key} className={style.menuEntry}>
          <label>
            <input
              type="checkbox"
              checked={state}
              onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
            />
            <div>
              {label && <div className={style.label}>{label}</div>}
              {description && <div className={style.description}>{description}</div>}
            </div>
          </label>
        </div>
      ))}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsAccessibility;
