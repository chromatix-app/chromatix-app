// ======================================================================
// IMPORTS
// ======================================================================

import { Icon, SettingsKeyboard, TitleHeading } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const Component = () => {
  return (
    <>
      <TitleHeading
        title={
          <>
            Settings{' '}
            <span className="u-gt">
              <Icon icon="ArrowRightIcon" cover stroke strokeWidth={3} />
            </span>{' '}
            Keyboard
          </>
        }
      />
      <SettingsKeyboard />
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
