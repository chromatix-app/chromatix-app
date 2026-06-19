// ======================================================================
// IMPORTS
// ======================================================================

import { Icon, SettingsControls, TitleHeading } from 'js/components';

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
            Controls
          </>
        }
      />
      <SettingsControls />
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
