// ======================================================================
// IMPORTS
// ======================================================================

import { Icon, SettingsAppearance, TitleHeading } from 'js/components';

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
            Appearance
          </>
        }
      />
      <SettingsAppearance />
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
