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

  const allArtistCompilationAlbums = useSelector(({ appModel }) => appModel.allArtistCompilationAlbums);
  const artistCompilations = allArtistCompilationAlbums[libraryId + '-' + artistId];

  const artistThumb = artistInfo?.thumb;
  const artistName = artistInfo?.title;
  const artistAlbumTotal = artistAlbums?.length || 0;
  const artistRelatedTotal = artistRelated?.reduce((acc, entry) => acc + entry.related.length, 0) || 0;
  const artistReleases = artistAlbumTotal + artistRelatedTotal;
  const artistCountry = artistInfo?.country;
  const artistGenre = artistInfo?.genre;
  const artistRating = artistInfo?.userRating;

  // Get the required artist data
  useEffect(() => {
    plex.getAllArtists();
    plex.getAllArtistAlbums(libraryId, artistId);
    plex.getAllArtistRelated(libraryId, artistId);
  }, [artistId, libraryId]);

  // Fallback in case artist data is not included in the allArtists array
  useEffect(() => {
    if (allArtists && !artistInfo) {
      plex.getArtistDetails(libraryId, artistId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allArtists, artistInfo]);

  // Get the artist compilation albums
  useEffect(() => {
    if (artistName && artistId && libraryId) {
      plex.getAllArtistCompilationAlbums(libraryId, artistId, artistName);
    }
  }, [artistName, artistId, libraryId]);

  return {
    artistInfo,

    artistAlbums,
    artistRelated,
    artistCompilations,

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
