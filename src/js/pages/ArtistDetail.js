// ======================================================================
// IMPORTS
// ======================================================================

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ListCards, Loading, TitleHeading, TitleSection } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistDetail = () => {
  const { artistId } = useParams();

  const allArtists = useSelector(({ appModel }) => appModel.allArtists);
  const currentArtist = allArtists?.filter((artist) => artist.artistId === artistId)[0];

  const allArtistAlbums = useSelector(({ appModel }) => appModel.allArtistAlbums);
  const currentArtistAlbums = allArtistAlbums[artistId];

  const allArtistRelated = useSelector(({ appModel }) => appModel.allArtistRelated);
  const currentArtistRelated = allArtistRelated[artistId];

  const artistThumb = currentArtist?.thumb;
  const artistName = currentArtist?.title;
  const artistAlbums = currentArtistAlbums?.length || 0;
  const artistRelated = currentArtistRelated?.reduce((acc, entry) => acc + entry.related.length, 0) || 0;
  const artistReleases = artistAlbums + artistRelated;
  const artistCountry = currentArtist?.country;
  const artistGenre = currentArtist?.genre;

  useEffect(() => {
    plex.getAllArtists();
    plex.getAllArtistAlbums(artistId);
    plex.getAllArtistRelated(artistId);
  }, [artistId]);

  return (
    <>
      {currentArtist && (
        <TitleHeading
          thumb={artistThumb}
          title={artistName}
          subtitle={
            currentArtistAlbums && currentArtistRelated ? (
              artistReleases + ' Release' + (artistReleases > 1 ? 's' : '')
            ) : (
              <>&nbsp;</>
            )
          }
          detail={currentArtistAlbums && currentArtistRelated ? artistCountry + ' • ' + artistGenre : <>&nbsp;</>}
        />
      )}
      {!(currentArtist && currentArtistAlbums && currentArtistRelated) && <Loading forceVisible inline />}
      {currentArtist && currentArtistAlbums && currentArtistRelated && (
        <>
          {currentArtistAlbums.length > 0 && (
            <>
              <TitleSection title="Albums" />
              <ListCards entries={currentArtistAlbums} />
            </>
          )}
          {currentArtistRelated &&
            currentArtistRelated.map((entry, index) => (
              <React.Fragment key={index}>
                <TitleSection title={entry.title} />
                <ListCards entries={entry.related} />
              </React.Fragment>
            ))}
        </>
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistDetail;
