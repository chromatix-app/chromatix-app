// ======================================================================
// IMPORTS
// ======================================================================

import { PageText, TitleHeading } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const Component = () => {
  return (
    <>
      <TitleHeading title="Last.fm" />
      <PageText>
        <p>
          Linking your account to{' '}
          <a href="https://www.last.fm/" target="_blank" rel="noreferrer nofollow">
            Last.fm
          </a>{' '}
          must be done on the Plex website, and will affect all music playback from any Plex client that you are logged
          into - not just Chromatix.
        </p>
        <p>
          You can link your Plex account to Last.fm{' '}
          <a href="https://plex.tv/users/other-services" target="_blank" rel="noreferrer nofollow">
            here
          </a>
          .
        </p>
        <p>A fun fact...</p>
        <p>
          Many years ago, I actually built the{' '}
          <a href="https://www.last.fm/dashboard" target="_blank" rel="noreferrer nofollow">
            Last.fm dashboard
          </a>{' '}
          page!
        </p>
      </PageText>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
