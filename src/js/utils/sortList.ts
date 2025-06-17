type Entry = {
  addedAt?: string;
  album?: string;
  artist?: string;
  bitrate?: number;
  codec?: string;
  country?: string;
  discNumber?: number;
  duration?: number;
  genre?: string;
  kind?: string;
  lastPlayed?: string;
  releaseDate?: string;
  sortOrder?: number;
  title?: string;
  totalTracks?: number;
  trackNumber?: number;
  userRating?: number;
};

type SortFunction = (a: Entry, b: Entry) => number;

const forcedSortKeys: { [key: string]: { key: string; direction: 'asc' | 'desc' } } = {
  kind: {
    key: 'sortOrder',
    direction: 'asc',
  },
};

const sortList = ({
  entries,
  options,
  direction = 'asc',
  sortNumbersFirst = false,
}: {
  entries: Entry[];
  options: string;
  direction?: 'asc' | 'desc';
  sortNumbersFirst?: boolean;
}): Entry[] => {
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
    quaternaryDirection,
    sortNumbersFirst
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
  quaternaryDirection: 'asc' | 'desc' = 'asc',
  sortNumbersFirst: boolean = false
): Entry[] => {
  // Create enhanced sort functions with the setting captured in the closure
  const sortFunctions = enhanceSortFunctions(sortNumbersFirst);

  primarySortKey = sortFunctions[primarySortKey] ? primarySortKey : 'title';
  secondarySortKey = sortFunctions[secondarySortKey] ? secondarySortKey : 'title';
  tertiarySortKey = sortFunctions[tertiarySortKey] ? tertiarySortKey : 'title';

  const primaryDirectionFactor = primaryDirection === 'asc' ? 1 : -1;
  const secondaryDirectionFactor = secondaryDirection === 'asc' ? 1 : -1;
  const tertiaryDirectionFactor = tertiaryDirection === 'asc' ? 1 : -1;
  const quaternaryDirectionFactor = quaternaryDirection === 'asc' ? 1 : -1;

  return [...entries].sort((a, b) => {
    const primaryComparison = primaryDirectionFactor * sortFunctions[primarySortKey](a, b);
    if (primaryComparison === 0 && secondarySortKey) {
      const secondaryComparison = secondaryDirectionFactor * sortFunctions[secondarySortKey](a, b);
      if (secondaryComparison === 0 && tertiarySortKey) {
        const tertiaryComparison = tertiaryDirectionFactor * sortFunctions[tertiarySortKey](a, b);
        if (tertiaryComparison === 0 && quaternarySortKey) {
          const quaternaryComparison = quaternaryDirectionFactor * sortFunctions[quaternarySortKey](a, b);
          return quaternaryComparison;
        }
        return tertiaryComparison;
      }
      return secondaryComparison;
    }
    return primaryComparison;
  });
};

// Function that enhances sort functions with the current settings
const enhanceSortFunctions = (sortNumbersFirst: boolean): Record<string, SortFunction> => {
  // If sortNumbersFirst is true, we can just use the base sort functions
  if (sortNumbersFirst) {
    return baseSortFunctions;
  }

  // Otherwise, we need to enhance the string sort functions
  const createStringSortFunction = (key: keyof Entry): SortFunction => {
    return (a, b) => {
      const valueA = ((a[key] as string) ?? '').toUpperCase();
      const valueB = ((b[key] as string) ?? '').toUpperCase();

      const isFirstCharNumberA = valueA.length > 0 && !isNaN(Number(valueA[0]));
      const isFirstCharNumberB = valueB.length > 0 && !isNaN(Number(valueB[0]));

      // Handle cases when one starts with a number and the other doesn't
      if (isFirstCharNumberA && !isFirstCharNumberB) {
        return sortNumbersFirst ? -1 : 1; // Numbers first or last based on preference
      }
      if (!isFirstCharNumberA && isFirstCharNumberB) {
        return sortNumbersFirst ? 1 : -1; // Numbers first or last based on preference
      }

      // If both start with numbers, try to compare them numerically
      if (isFirstCharNumberA && isFirstCharNumberB) {
        // Extract leading numbers from both strings
        const numRegex = /^(\d+)/;
        const matchA = valueA.match(numRegex);
        const matchB = valueB.match(numRegex);

        if (matchA && matchB) {
          const numA = parseInt(matchA[1], 10);
          const numB = parseInt(matchB[1], 10);
          if (numA !== numB) {
            return numA - numB; // Sort numerically
          }
        }
      }

      return valueA.localeCompare(valueB);
    };
  };

  // Create enhanced sort functions only when sortNumbersFirst is true
  return {
    ...baseSortFunctions,
    album: createStringSortFunction('album'),
    artist: createStringSortFunction('artist'),
    codec: createStringSortFunction('codec'),
    country: createStringSortFunction('country'),
    genre: createStringSortFunction('genre'),
    kind: createStringSortFunction('kind'),
    title: createStringSortFunction('title'),
  };
};

const baseSortFunctions: Record<string, SortFunction> = {
  // Strings
  album: (a, b) => (a.album ?? '').localeCompare(b.album ?? '', undefined, { numeric: true }),
  artist: (a, b) => (a.artist ?? '').localeCompare(b.artist ?? '', undefined, { numeric: true }),
  codec: (a, b) => (a.codec ?? '').localeCompare(b.codec ?? '', undefined, { numeric: true }),
  country: (a, b) => (a.country ?? '').localeCompare(b.country ?? '', undefined, { numeric: true }),
  genre: (a, b) => (a.genre ?? '').localeCompare(b.genre ?? '', undefined, { numeric: true }),
  kind: (a, b) => (a.kind ?? '').localeCompare(b.kind ?? '', undefined, { numeric: true }),
  title: (a, b) => (a.title ?? '').localeCompare(b.title ?? '', undefined, { numeric: true }),

  // Numbers
  bitrate: (a, b) => (a.bitrate ?? 0) - (b.bitrate ?? 0),
  discNumber: (a, b) => (a.discNumber ?? 0) - (b.discNumber ?? 0),
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
