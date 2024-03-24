// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { Card } from 'js/components';
import style from './ListAlbums.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ListAlbums = () => {
  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums);

  if (allAlbums) {
    return (
      <div className={style.wrap}>
        {allAlbums.map((artist, index) => (
          <Card key={index} {...artist} />
        ))}
      </div>
    );
  }
};

// ======================================================================
// EXPORT
// ======================================================================

export default ListAlbums;
