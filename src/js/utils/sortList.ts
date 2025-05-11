type Entry = {
  kind?: string;
  title?: string;
  album?: string;
  artist?: string;
  country?: string;
  genre?: string;
  codec?: string;
  bitrate?: number;
  duration?: number;
  sortOrder?: number;
  totalTracks?: number;
  trackNumber?: number;
  discNumber?: number;
  userRating?: number;
  addedAt?: string;
  lastPlayed?: string;
  releaseDate?: string;
};

type SortFunction = (a: Entry, b: Entry) => number;

const forcedSortKeys: { [key: string]: { key: string; direction: 'asc' | 'desc' } } = {
  kind: {
    key: 'sortOrder',
    direction: 'asc',
  },
};

const sortList = (entries: Entry[], options: string, direction: 'asc' | 'desc' = 'asc'): Entry[] => {
  const optionsArray = options.split('-');

  const primarySortKey = optionsArray[0];
  let primaryDirection: 'asc' | 'desc' = (optionsArray[1] as 'asc' | 'desc') || 'asc';

  const secondarySortKey = optionsArray[2] || forcedSortKeys[primarySortKey]?.key || 'title';
  let secondaryDirection: 'asc' | 'desc' = (optionsArray[3] as 'asc' | 'desc') || 'asc';

  const tertiarySortKey = optionsArray[4] || forcedSortKeys[primarySortKey]?.key || 'title';
  let tertiaryDirection: 'asc' | 'desc' = (optionsArray[5] as 'asc' | 'desc') || 'asc';

  const quaternarySortKey = optionsArray[6] || forcedSortKeys[primarySortKey]?.key || 'title';
  let quaternaryDirection: 'asc' | 'desc' = (optionsArray[7] as 'asc' | 'desc') || 'asc';

  // if the overall sort is reversed, reverse the sort keys (but ignore our forced sort keys)
  // (this is essentially used to keep folders on top of tracks when viewing a folder)
  if (direction === 'desc') {
    primaryDirection = primaryDirection === 'asc' ? 'desc' : 'asc';
    secondaryDirection = forcedSortKeys[primarySortKey]?.direction
      ? forcedSortKeys[primarySortKey].direction
      : secondaryDirection === 'asc'
        ? 'desc'
        : 'asc';
    tertiaryDirection = forcedSortKeys[primarySortKey]?.direction
      ? forcedSortKeys[primarySortKey].direction
      : tertiaryDirection === 'asc'
        ? 'desc'
        : 'asc';
    quaternaryDirection = forcedSortKeys[primarySortKey]?.direction
      ? forcedSortKeys[primarySortKey].direction
      : quaternaryDirection === 'asc'
        ? 'desc'
        : 'asc';
  }

  // console.log(primarySortKey, secondarySortKey, tertiarySortKey);
  // console.log(direction, primaryDirection, secondaryDirection, tertiaryDirection);
  // console.log(direction, primarySortKey, primaryDirection, secondarySortKey, secondaryDirection);

  return doSorting(
    entries,
    primarySortKey,
    primaryDirection,
    secondarySortKey,
    secondaryDirection,
    tertiarySortKey,
    tertiaryDirection,
    quaternarySortKey,
    quaternaryDirection
  );
};

const doSorting = (
  entries: Entry[],
  primarySortKey: string,
  primaryDirection: 'asc' | 'desc' = 'asc',
  secondarySortKey: string = 'title',
  secondaryDirection: 'asc' | 'desc' = 'asc',
  tertiarySortKey: string = 'title',
  tertiaryDirection: 'asc' | 'desc' = 'asc',
  quaternarySortKey: string = 'title',
  quaternaryDirection: 'asc' | 'desc' = 'asc'
): Entry[] => {
  primarySortKey = sortFunctions[primarySortKey] ? primarySortKey : 'title';
  secondarySortKey = sortFunctions[secondarySortKey] ? secondarySortKey : 'title';
  tertiarySortKey = sortFunctions[tertiarySortKey] ? tertiarySortKey : 'title';

  const primaryDirectionFactor = primaryDirection === 'asc' ? 1 : -1;
  const secondaryDirectionFactor = secondaryDirection === 'asc' ? 1 : -1;
  const tertiaryDirectionFactor = tertiaryDirection === 'asc' ? 1 : -1;

  return [...entries].sort((a, b) => {
    const primaryComparison = primaryDirectionFactor * sortFunctions[primarySortKey](a, b);
    if (primaryComparison === 0 && secondarySortKey) {
      const secondaryComparison = secondaryDirectionFactor * sortFunctions[secondarySortKey](a, b);
      if (secondaryComparison === 0 && tertiarySortKey) {
        const tertiaryComparison = tertiaryDirectionFactor * sortFunctions[tertiarySortKey](a, b);
        if (tertiaryComparison === 0 && quaternarySortKey) {
          const quaternaryComparison = tertiaryDirectionFactor * sortFunctions[quaternarySortKey](a, b);
          return quaternaryComparison;
        }
        return tertiaryComparison;
      }
      return secondaryComparison;
    }
    return primaryComparison;
  });
};

const sortFunctions: Record<string, SortFunction> = {
  // Strings
  kind: (a, b) => (a.kind ?? '').localeCompare(b.kind ?? ''),
  title: (a, b) => {
    const nameA = (a.title ?? '').toUpperCase();
    const nameB = (b.title ?? '').toUpperCase();
    if (!isNaN(Number(nameA[0])) && isNaN(Number(nameB[0]))) {
      return 1;
    }
    if (isNaN(Number(nameA[0])) && !isNaN(Number(nameB[0]))) {
      return -1;
    }
    return nameA.localeCompare(nameB);
  },
  album: (a, b) => (a.album ?? '').localeCompare(b.album ?? ''),
  artist: (a, b) => (a.artist ?? '').localeCompare(b.artist ?? ''),
  country: (a, b) => (a.country ?? '').localeCompare(b.country ?? ''),
  genre: (a, b) => (a.genre ?? '').localeCompare(b.genre ?? ''),
  codec: (a, b) => (a.codec ?? '').localeCompare(b.codec ?? ''),

  // Numbers
  bitrate: (a, b) => (a.bitrate ?? 0) - (b.bitrate ?? 0),
  duration: (a, b) => (a.duration ?? 0) - (b.duration ?? 0),
  sortOrder: (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  totalTracks: (a, b) => (a.totalTracks ?? 0) - (b.totalTracks ?? 0),
  trackNumber: (a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0),
  discNumber: (a, b) => (a.discNumber ?? 0) - (b.discNumber ?? 0),
  userRating: (a, b) => (a.userRating ?? 0) - (b.userRating ?? 0),

  // Dates
  addedAt: (a, b) => new Date(a.addedAt ?? '1970-01-01').getTime() - new Date(b.addedAt ?? '1970-01-01').getTime(),
  lastPlayed: (a, b) =>
    new Date(a.lastPlayed ?? '1970-01-01').getTime() - new Date(b.lastPlayed ?? '1970-01-01').getTime(),
  releaseDate: (a, b) =>
    new Date(a.releaseDate ?? '1970-01-01').getTime() - new Date(b.releaseDate ?? '1970-01-01').getTime(),
};

export default sortList;
