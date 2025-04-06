import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetArtistDetail = ({ libraryId, artistId }) => {
  const dispatch = useDispatch();

  const allArtists = useSelector(({ appModel }) => appModel.allArtists);
  const artistInfo = allArtists?.find((artist) => artist.artistId === artistId);

  const artistThumb = artistInfo?.thumb;
  const artistName = artistInfo?.title;
  const artistCountry = artistInfo?.country;
  const artistGenre = artistInfo?.genre;
  const artistRating = artistInfo?.userRating;

  const colArtistAlbumsGenre = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsGenre);
  const colArtistAlbumsReleaseDate = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsReleaseDate);
  const colArtistAlbumsAddedAt = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsAddedAt);
  const colArtistAlbumsLastPlayed = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsLastPlayed);
  const colArtistAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsUserRating);

  const allArtistAlbums = useSelector(({ appModel }) => appModel.allArtistAlbums);
  const artistAlbums = allArtistAlbums[libraryId + '-' + artistId];

  const allArtistRelated = useSelector(({ appModel }) => appModel.allArtistRelated);
  const artistRelated = allArtistRelated[libraryId + '-' + artistId];

  const allArtistCompilationAlbums = useSelector(({ appModel }) => appModel.allArtistCompilationAlbums);
  const artistCompilations = allArtistCompilationAlbums[libraryId + '-' + artistId];

  const artistAlbumTotal = artistAlbums?.length || 0;
  const artistRelatedTotal = artistRelated?.reduce((acc, entry) => acc + entry.related.length, 0) || 0;
  const artistCompilationsTotal = artistCompilations?.length || 0;
  const artistReleasesTotal = artistAlbumTotal + artistRelatedTotal + artistCompilationsTotal;

  const viewArtistAlbums = useSelector(({ sessionModel }) => sessionModel.viewArtistAlbums);
  const sortArtistAlbums = useSelector(({ sessionModel }) => sessionModel.sortArtistAlbums);
  const orderArtistAlbums = useSelector(({ sessionModel }) => sessionModel.orderArtistAlbums);

  // Prevent sub-sorting in list view
  const isSubSortList = viewArtistAlbums === 'list' && sortArtistAlbums.split('-').length > 2;

  const actualSortArtistAlbums = isSubSortList ? 'artist' : sortArtistAlbums;

  // Sort albums
  const sortedArtistAlbums = artistAlbums ? sortList(artistAlbums, actualSortArtistAlbums, orderArtistAlbums) : null;
  const sortedArtistRelated = artistRelated?.map((entry) => {
    const sortedEntry =
      entry && entry.related ? sortList(entry.related, actualSortArtistAlbums, orderArtistAlbums) : null;
    return {
      ...entry,
      related: sortedEntry,
    };
  });
  const sortedArtistCompilations = artistCompilations
    ? sortList(artistCompilations, actualSortArtistAlbums, orderArtistAlbums)
    : null;

  // Combine all albums into a single array
  const allAlbums = [];
  if (sortedArtistAlbums) {
    allAlbums.push(
      ...sortedArtistAlbums.map((album) => {
        return {
          ...album,
          albumGroup: 'Albums',
        };
      })
    );
  }
  if (sortedArtistRelated) {
    for (let i = 0; i < sortedArtistRelated.length; i++) {
      const related = sortedArtistRelated[i];
      for (let j = 0; j < related.related.length; j++) {
        const album = related.related[j];
        allAlbums.push({
          ...album,
          albumGroup: related.title,
        });
      }
    }
  }
  if (sortedArtistCompilations) {
    allAlbums.push(
      ...sortedArtistCompilations.map((album) => {
        return {
          ...album,
          albumGroup: 'Appears On',
        };
      })
    );
  }

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

  const setColumnVisibility = (columnKey, columnValue) => {
    dispatch.sessionModel.setSessionState({
      [columnKey]: columnValue,
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
    artistThumb,
    artistName,
    artistCountry,
    artistGenre,
    artistRating,

    artistAlbums: sortedArtistAlbums,
    artistRelated: sortedArtistRelated,
    artistCompilations: sortedArtistCompilations,
    sortedArtistAlbums: allAlbums,

    colOptions: {
      genre: colArtistAlbumsGenre,
      releaseDate: colArtistAlbumsReleaseDate,
      addedAt: colArtistAlbumsAddedAt,
      lastPlayed: colArtistAlbumsLastPlayed,
      userRating: colArtistAlbumsUserRating,
    },

    artistAlbumTotal,
    artistRelatedTotal,
    artistReleasesTotal,

    viewArtistAlbums,
    sortArtistAlbums: actualSortArtistAlbums,
    orderArtistAlbums,

    setViewArtistAlbums,
    setSortArtistAlbums,
    setOrderArtistAlbums,
    setColumnVisibility,
  };
};

export default useGetArtistDetail;
