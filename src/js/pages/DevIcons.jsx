// ======================================================================
// IMPORTS
// ======================================================================

import { Icon, PageText, TitleHeading } from 'js/components';
import { generalIcons, siteIcons } from 'js/components/Icon/Icon';

// ======================================================================
// COMPONENT
// ======================================================================

const Component = () => {
  return (
    <>
      <TitleHeading title="Icons" />
      <PageText fontSize="small" wysiwyg={false}>
        {Object.keys(generalIcons).map((iconName) => (
          <div key={iconName}>
            <span
              style={{
                display: 'inline-block',
                position: 'relative',
                width: 14,
                height: 14,
                marginRight: 16,
                top: 2,
              }}
            >
              <Icon icon={iconName} cover />
            </span>
            <span
              style={{
                display: 'inline-block',
                position: 'relative',
                width: 14,
                height: 14,
                marginRight: 16,
                top: 2,
              }}
            >
              <Icon icon={iconName} cover stroke />
            </span>
            {iconName}
          </div>
        ))}

        <br />

        {Object.keys(siteIcons).map((iconName) => (
          <div key={iconName}>
            <span
              style={{
                display: 'inline-block',
                position: 'relative',
                width: 28,
                height: 28,
                marginRight: 16,
                marginBottom: 4,
                top: -5,
              }}
            >
              <Icon icon={iconName} cover />
            </span>
            {iconName}
          </div>
        ))}
      </PageText>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
