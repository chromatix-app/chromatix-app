type Entry = {
  title?: string;
  album?: string;
  artist?: string;
  genre?: string;
  duration?: number;
  sortOrder?: number;
  totalTracks?: number;
  trackNumber?: number;
  userRating?: number;
  addedAt?: string;
  lastPlayed?: string;
  releaseDate?: string;
};

type SortFunction = (a: Entry, b: Entry) => number;

const sortList = (entries: Entry[], options: string, direction: 'asc' | 'desc' = 'asc'): Entry[] => {
  const optionsArray = options.split('-');

  const primarySortKey = optionsArray[0];
  let primaryDirection: 'asc' | 'desc' = (optionsArray[1] as 'asc' | 'desc') || 'asc';

  const secondarySortKey = optionsArray[2] || 'title';
  let secondaryDirection: 'asc' | 'desc' = (optionsArray[3] as 'asc' | 'desc') || 'asc';

  if (direction === 'desc') {
    primaryDirection = primaryDirection === 'asc' ? 'desc' : 'asc';
    secondaryDirection = secondaryDirection === 'asc' ? 'desc' : 'asc';
  }

  return doSorting(entries, primarySortKey, primaryDirection, secondarySortKey, secondaryDirection);
};

const doSorting = (
  entries: Entry[],
  primarySortKey: string,
  primaryDirection: 'asc' | 'desc' = 'asc',
  secondarySortKey: string = 'title',
  secondaryDirection: 'asc' | 'desc' = 'asc'
): Entry[] => {
  primarySortKey = sortFunctions[primarySortKey] ? primarySortKey : 'title';
  secondarySortKey = sortFunctions[secondarySortKey] ? secondarySortKey : 'title';

  const primaryDirectionFactor = primaryDirection === 'asc' ? 1 : -1;
  const secondaryDirectionFactor = secondaryDirection === 'asc' ? 1 : -1;

  return [...entries].sort((a, b) => {
    const primaryComparison = primaryDirectionFactor * sortFunctions[primarySortKey](a, b);
    if (primaryComparison === 0 && secondarySortKey) {
      return secondaryDirectionFactor * sortFunctions[secondarySortKey](a, b);
    }
    return primaryComparison;
  });
};

const sortFunctions: Record<string, SortFunction> = {
  // Strings
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
  genre: (a, b) => (a.genre ?? '').localeCompare(b.genre ?? ''),

  // Numbers
  duration: (a, b) => (a.duration ?? 0) - (b.duration ?? 0),
  sortOrder: (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  totalTracks: (a, b) => (a.totalTracks ?? 0) - (b.totalTracks ?? 0),
  trackNumber: (a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0),
  userRating: (a, b) => (a.userRating ?? 0) - (b.userRating ?? 0),

  // Dates
  addedAt: (a, b) => new Date(a.addedAt ?? '1970-01-01').getTime() - new Date(b.addedAt ?? '1970-01-01').getTime(),
  lastPlayed: (a, b) =>
    new Date(a.lastPlayed ?? '1970-01-01').getTime() - new Date(b.lastPlayed ?? '1970-01-01').getTime(),
  releaseDate: (a, b) =>
    new Date(a.releaseDate ?? '1970-01-01').getTime() - new Date(b.releaseDate ?? '1970-01-01').getTime(),
};

export default sortList;
