// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { ListArtists, Title } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const Artists = () => {
  const allArtists = useSelector(({ appModel }) => appModel.allArtists);

  return (
    <main>
      <Title title="Artists" subtitle={allArtists?.length ? allArtists?.length + ' Artists' : null} />
      <ListArtists />
    </main>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Artists;
