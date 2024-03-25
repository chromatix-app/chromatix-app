// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { ListAlbums, Title } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const Albums = () => {
  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums);

  return (
    <main>
      <Title title="Albums" subtitle={allAlbums?.length ? allAlbums?.length + ' Albums' : null} />
      <ListAlbums />
    </main>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Albums;
