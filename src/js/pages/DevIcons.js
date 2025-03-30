// ======================================================================
// IMPORTS
// ======================================================================

import { Icon, PageText, TitleHeading } from 'js/components';
import { customIcons } from 'js/components/Icon/Icon';

// ======================================================================
// COMPONENT
// ======================================================================

const Component = () => {
  console.log(customIcons);
  return (
    <>
      <TitleHeading title="Icons" />
      <PageText fontSize="small" wysiwyg={false}>
        {Object.keys(customIcons).map((iconName) => (
          <div key={iconName}>
            <span
              style={{
                display: 'inline-block',
                position: 'relative',
                width: 14,
                height: 14,
                marginRight: 12,
                top: 2,
              }}
            >
              <Icon icon={iconName} cover stroke />
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
