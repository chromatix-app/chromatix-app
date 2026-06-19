// ======================================================================
// IMPORTS
// ======================================================================

import { Icon, PageText, TitleHeading } from 'js/components';

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
            Last.fm
          </>
        }
      />
      <PageText fontSize="small">
        <p>
          Linking your account to{' '}
          <a href="https://www.last.fm/" target="_blank" rel="noreferrer nofollow" draggable="false">
            Last.fm
          </a>{' '}
          is not available directly in Chromatix, and must instead be done on your media server account. This will
          affect all music playback from any client that you are logged into - not just Chromatix.
        </p>

        <br />
        <h2>Linking your account</h2>
        <p>
          Plex users can link their account to Last.fm{' '}
          <a href="https://plex.tv/users/other-services" target="_blank" rel="noreferrer nofollow" draggable="false">
            here
          </a>
          .
        </p>
        <p>
          Jellyfin users can link their account to Last.fm using a plugin such as{' '}
          <a
            href="https://github.com/jesseward/jellyfin-plugin-lastfm"
            target="_blank"
            rel="noreferrer nofollow"
            draggable="false"
          >
            this one
          </a>
          .
        </p>

        <br />
        <h2>Notes</h2>
        <p>
          The "log playback events to server" option must be enabled in Chromatix general settings for this to work.
        </p>

        <br />
        <h2>Issues</h2>
        <p>
          At present, managed accounts (such as those created by Plex Home) may not work with Last.fm scrobbling. It
          seems that only users listening from their own server can currently scrobble tracks.
        </p>

        {/* <hr />
        <p>
          <i>A fun fact...</i>
        </p>
        <p>
          Many years ago, I actually built the{' '}
          <a href="https://www.last.fm/dashboard" target="_blank" rel="noreferrer nofollow" draggable="false">
            Last.fm dashboard
          </a>{' '}
          page!
        </p> */}
      </PageText>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
