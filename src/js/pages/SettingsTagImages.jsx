// ======================================================================
// IMPORTS
// ======================================================================

import { Icon, PageText, SettingsTagImages, TitleHeading } from 'js/components';

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
            Tag Images
          </>
        }
      />
      <PageText fontSize="small">
        <p>This is an experimental new feature allowing you to use images for all your music genres and other tags.</p>
        <p>
          The sheer number of tags made manual curation unfeasible, but batch-generated images are a practical
          alternative. Yes, people have strong feelings on AI images, which is why this is entirely optional.
          Ultimately, the goal is to have something for every tag, and then improve things from there.
        </p>
        <p>
          Some of the generated images are good. Some are ok. Many are terrible. Most are purple for some reason.
          Hopefully nothing in here is in any way insensitive or offensive, but if you see anything that is, please let
          us know.
        </p>
        <p>
          You can learn more and contribute to the image repository{' '}
          <a
            href="https://github.com/chromatix-app/chromatix-assets"
            target="_blank"
            rel="noreferrer nofollow"
            draggable="false"
          >
            here
          </a>
          .
        </p>
      </PageText>
      <SettingsTagImages />
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
