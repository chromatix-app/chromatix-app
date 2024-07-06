import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import * as plex from 'js/services/plex';

const useGetArtistDetail = ({ libraryId, artistId }) => {
  // const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const allArtists = useSelector(({ appModel }) => appModel.allArtists);
  const artistInfo = allArtists?.filter((artist) => artist.artistId === artistId)[0];

  const allArtistAlbums = useSelector(({ appModel }) => appModel.allArtistAlbums);
  const artistAlbums = allArtistAlbums[libraryId + '-' + artistId];

  const allArtistRelated = useSelector(({ appModel }) => appModel.allArtistRelated);
  const artistRelated = allArtistRelated[libraryId + '-' + artistId];

  const artistThumb = artistInfo?.thumb;
  const artistName = artistInfo?.title;
  const artistAlbumTotal = artistAlbums?.length || 0;
  const artistRelatedTotal = artistRelated?.reduce((acc, entry) => acc + entry.related.length, 0) || 0;
  const artistReleases = artistAlbumTotal + artistRelatedTotal;
  const artistCountry = artistInfo?.country;
  const artistGenre = artistInfo?.genre;
  const artistRating = artistInfo?.userRating;

  useEffect(() => {
    plex.getAllArtists();
    plex.getAllArtistAlbums(libraryId, artistId);
    plex.getAllArtistRelated(libraryId, artistId);
  }, [artistId, libraryId]);

  useEffect(() => {
    if (allArtists && !artistInfo) {
      plex.getArtistDetails(libraryId, artistId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allArtists, artistInfo]);

  return {
    artistInfo,

    artistAlbums: artistAlbums,
    artistRelated: artistRelated,

    artistThumb,
    artistName,
    artistAlbumTotal,
    artistRelatedTotal,
    artistReleases,
    artistCountry,
    artistGenre,
    artistRating,
  };
};

export default useGetArtistDetail;
