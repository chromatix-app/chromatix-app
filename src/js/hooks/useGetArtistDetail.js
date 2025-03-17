import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetArtistDetail = ({ libraryId, artistId }) => {
  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const allArtists = useSelector(({ appModel }) => appModel.allArtists);
  const artistInfo = allArtists?.find((artist) => artist.artistId === artistId);

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

  const viewArtistAlbums = useSelector(({ sessionModel }) => sessionModel.viewArtistAlbums);
  const sortArtistAlbums = useSelector(({ sessionModel }) => sessionModel.sortArtistAlbums);
  const orderArtistAlbums = useSelector(({ sessionModel }) => sessionModel.orderArtistAlbums);

  // prevent sorting by rating if ratings are hidden
  const isRatingSortHidden = !optionShowStarRatings && sortArtistAlbums === 'userRating';

  // prevent sub-sorting in list view
  const isSubSortList = viewArtistAlbums === 'list' && sortArtistAlbums.split('-').length > 2;

  const actualSortArtistAlbums = isRatingSortHidden ? 'title' : isSubSortList ? 'artist' : sortArtistAlbums;
  const actualOrderArtistAlbums = isRatingSortHidden ? 'asc' : orderArtistAlbums;

  const sortedArtistAlbums = artistAlbums
    ? sortList(artistAlbums, actualSortArtistAlbums, actualOrderArtistAlbums)
    : null;

  const sortedArtistRelated = artistRelated?.map((entry) => {
    const sortedEntry =
      entry && entry.related ? sortList(entry.related, actualSortArtistAlbums, actualOrderArtistAlbums) : null;
    return {
      ...entry,
      related: sortedEntry,
    };
  });

  const sortedArtistCompilations = artistCompilations
    ? sortList(artistCompilations, actualSortArtistAlbums, actualOrderArtistAlbums)
    : null;

  const setViewArtistAlbums = (viewArtistAlbums) => {
    dispatch.sessionModel.setSessionState({
      viewArtistAlbums,
    });
  };

  const setSortArtistAlbums = (sortArtistAlbums) => {
    dispatch.sessionModel.setSessionState({
      sortArtistAlbums,
    });
  };

  const setOrderArtistAlbums = (orderArtistAlbums) => {
    dispatch.sessionModel.setSessionState({
      sortArtistAlbums: actualSortArtistAlbums,
      orderArtistAlbums,
    });
  };

  // Get the required artist data
  useEffect(() => {
    // plex.getAllArtists();
    if (!artistInfo) {
      plex.getArtistDetails(libraryId, artistId);
    }
    plex.getAllArtistAlbums(libraryId, artistId);
    plex.getAllArtistRelated(libraryId, artistId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      plex.getAllArtistAppearanceAlbums(libraryId, artistId, artistName);
    }
  }, [artistName, artistId, libraryId]);

  return {
    artistInfo,

    artistAlbums: sortedArtistAlbums,
    artistRelated: sortedArtistRelated,
    artistCompilations: sortedArtistCompilations,

    artistThumb,
    artistName,
    artistAlbumTotal,
    artistRelatedTotal,
    artistReleases,
    artistCountry,
    artistGenre,
    artistRating,

    viewArtistAlbums,
    sortArtistAlbums: actualSortArtistAlbums,
    orderArtistAlbums: actualOrderArtistAlbums,

    setViewArtistAlbums,
    setSortArtistAlbums,
    setOrderArtistAlbums,
  };
};

export default useGetArtistDetail;
