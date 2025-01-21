// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ListCards, Loading, TitleHeading } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistStyleList = () => {
  const allArtistStyles = useSelector(({ appModel }) => appModel.allArtistStyles);

  useEffect(() => {
    plex.getAllArtistStyles();
  }, []);

  return (
    <>
      <TitleHeading
        title="Artist Styles"
        subtitle={
          allArtistStyles ? (
            allArtistStyles?.length + ' Artist Style' + (allArtistStyles?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
      />
      {!allArtistStyles && <Loading forceVisible inline />}
      {allArtistStyles && <ListCards variant="artistStyles" entries={allArtistStyles} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistStyleList;
