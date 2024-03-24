// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { Card } from 'js/components';
import style from './ListArtists.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ListArtists = () => {
  const allArtists = useSelector(({ appModel }) => appModel.allArtists);

  if (allArtists) {
    return (
      <div className={style.wrap}>
        {allArtists.map((artist, index) => (
          <Card key={index} {...artist} />
        ))}
      </div>
    );
  }
};

// ======================================================================
// EXPORT
// ======================================================================

export default ListArtists;
