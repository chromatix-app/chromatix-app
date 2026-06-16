// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { SettingsList } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsKeyboard = () => {
  return (
    <>
      <MediaKeySettings />
      <KeyboardShortcutSettings />
    </>
  );
};

//
// MEDIA KEYS
//

const MediaKeySettings = () => {
  const keyboardMediaKeys = useSelector(({ sessionModel }) => sessionModel.keyboardMediaKeys);

  const menuItems = [
    {
      key: 'keyboardMediaKeys',
      label: 'Allow keyboard/system media keys (play/pause, next, prev, etc.) to control playback.',
      description:
        'Note that this option may also affect system-wide media controls, including built in OS media controls, bluetooth devices, and other connected peripherals. We don’t recommend unchecking this option unless you have a specific reason to do so.',
      state: keyboardMediaKeys,
    },
  ];

  return <SettingsList title="Media Keys" menuItems={menuItems} />;
};

//
// KEYBOARD SHORTCUTS
//

const KeyboardShortcutSettings = () => {
  const keyboardSpace = useSelector(({ sessionModel }) => sessionModel.keyboardSpace);
  const keyboardArrows = useSelector(({ sessionModel }) => sessionModel.keyboardArrows);

  const menuItems = [
    {
      key: 'keyboardSpace',
      label: 'Use space bar to play/pause music.',
      state: keyboardSpace,
    },
    {
      key: 'keyboardArrows',
      label: 'Use left/right arrow keys to skip tracks.',
      state: keyboardArrows,
    },
  ];

  return <SettingsList title="Keyboard Shortcuts" menuItems={menuItems} />;
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsKeyboard;
