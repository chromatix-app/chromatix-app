// ======================================================================
// IMPORTS
// ======================================================================

import { Icon, SettingsPlayback, TitleHeading } from 'js/components';

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
            Playback
          </>
        }
      />
      <SettingsPlayback />
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
