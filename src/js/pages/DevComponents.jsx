// ======================================================================
// IMPORTS
// ======================================================================

import { Button, PageText, TitleHeading } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const Component = () => {
  return (
    <>
      <TitleHeading title="Components" />
      <PageText fontSize="small" wysiwyg={false}>
        <Button size="large">Large (Default)</Button>

        <br />

        <Button size="medium">Medium</Button>

        <br />

        <Button size="small">Small</Button>

        <br />

        <Button size="tiny">Tiny</Button>

        <br />

        <Button size="tiny" loading>
          Loading
        </Button>

        <br />

        <Button size="tiny" color="mono">
          Mono
        </Button>

        <br />

        <Button size="tiny" color="secondary">
          Secondary
        </Button>

        <br />

        <Button size="tiny" color="tertiary">
          Tertiary
        </Button>

        <br />

        <Button size="tiny" disabled>
          Disabled
        </Button>
      </PageText>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
