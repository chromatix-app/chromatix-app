// ======================================================================
// IMPORTS
// ======================================================================

import { Link } from 'react-router-dom';

import { authRoutes } from 'js/_config/routes';
import { PageText, TitleHeading } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const devRoutes = authRoutes.filter(({ component }) => component?.startsWith('Dev') && component !== 'DevIndex');

const Component = () => {
  return (
    <>
      <TitleHeading title="Dev" />
      <PageText fontSize="small" wysiwyg={false}>
        {devRoutes.map((route) => (
          <div key={route.path} className="mb-5">
            <Link to={route.path}>{route.component.replace('Dev', '')}</Link>
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
