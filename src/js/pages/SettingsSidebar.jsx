// ======================================================================
// IMPORTS
// ======================================================================

import { Icon, SettingsSidebar, TitleHeading } from 'js/components';

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
            Sidebar
          </>
        }
      />
      <SettingsSidebar />
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
