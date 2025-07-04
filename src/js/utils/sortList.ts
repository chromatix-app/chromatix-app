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
  isFavourite?: boolean;
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
type SortDirection = 'asc' | 'desc';

const LEADING_ARTICLES = ['A', 'An', 'The'];
const ARTICLE_AWARE_FIELDS = ['album', 'artist', 'title', 'genre'];

// For some primary sort keys, we want to enforce a specific secondary sort key and direction.
// For example, when sorting by userRating in any direction, we always want them to then be
// sorted by title in ascending order.
const FORCED_SORT_KEYS: { [key: string]: { key: string; direction: SortDirection } } = {
  isFavourite: {
    key: 'title',
    direction: 'asc',
  },
  kind: {
    key: 'sortOrder',
    direction: 'asc',
  },
  userRating: {
    key: 'title',
    direction: 'asc',
  },
};

/**
 * Sorts an array of entries with configurable multi-level sorting and advanced string handling.
 * Supports up to 4 levels of sorting with article-aware comparison and numeric sorting preferences.
 * @param entries - Array of entries to sort
 * @param options - Sort configuration string (e.g., "title-asc-artist-desc")
 * @param direction - Overall sort direction, reverses all levels except forced keys
 * @param sortNumbersFirst - Whether to sort numeric prefixes before alphabetic ones
 * @param ignoreLeadingArticles - Whether to ignore leading articles (A, An, The) in comparisons
 * @returns New sorted array of entries
 */

const sortList = ({
  entries,
  options,
  direction = 'asc',
  sortNumbersFirst = false,
  ignoreLeadingArticles = true,
}: {
  entries: Entry[];
  options: string;
  direction?: SortDirection;
  sortNumbersFirst?: boolean;
  ignoreLeadingArticles?: boolean;
}): Entry[] => {
  const optionsArray = options.split('-');

  const primarySortKey = optionsArray[0];
  let primaryDirection: SortDirection = (optionsArray[1] as SortDirection) || 'asc';

  const secondarySortKey = optionsArray[2] || FORCED_SORT_KEYS[primarySortKey]?.key || 'title';
  let secondaryDirection: SortDirection = (optionsArray[3] as SortDirection) || 'asc';

  const tertiarySortKey = optionsArray[4] || FORCED_SORT_KEYS[primarySortKey]?.key || 'title';
  let tertiaryDirection: SortDirection = (optionsArray[5] as SortDirection) || 'asc';

  const quaternarySortKey = optionsArray[6] || FORCED_SORT_KEYS[primarySortKey]?.key || 'title';
  let quaternaryDirection: SortDirection = (optionsArray[7] as SortDirection) || 'asc';

  // If the overall sort is reversed, reverse each of the individual sort keys
  // (Unless they match a forced sort key, which we keep as is)
  if (direction === 'desc') {
    primaryDirection = primaryDirection === 'asc' ? 'desc' : 'asc';
    secondaryDirection = FORCED_SORT_KEYS[primarySortKey]?.direction
      ? FORCED_SORT_KEYS[primarySortKey].direction
      : secondaryDirection === 'asc'
        ? 'desc'
        : 'asc';
    tertiaryDirection = FORCED_SORT_KEYS[primarySortKey]?.direction
      ? FORCED_SORT_KEYS[primarySortKey].direction
      : tertiaryDirection === 'asc'
        ? 'desc'
        : 'asc';
    quaternaryDirection = FORCED_SORT_KEYS[primarySortKey]?.direction
      ? FORCED_SORT_KEYS[primarySortKey].direction
      : quaternaryDirection === 'asc'
        ? 'desc'
        : 'asc';
  }

  // Create enhanced sort functions with the setting captured in the closure
  const sortFunctions = getSortFunctions(sortNumbersFirst, ignoreLeadingArticles);

  const validPrimaryKey = sortFunctions[primarySortKey] ? primarySortKey : 'title';
  const validSecondaryKey = sortFunctions[secondarySortKey] ? secondarySortKey : 'title';
  const validTertiaryKey = sortFunctions[tertiarySortKey] ? tertiarySortKey : 'title';

  const primaryDirectionFactor = primaryDirection === 'asc' ? 1 : -1;
  const secondaryDirectionFactor = secondaryDirection === 'asc' ? 1 : -1;
  const tertiaryDirectionFactor = tertiaryDirection === 'asc' ? 1 : -1;
  const quaternaryDirectionFactor = quaternaryDirection === 'asc' ? 1 : -1;

  return [...entries].sort((a, b) => {
    const primaryComparison = primaryDirectionFactor * sortFunctions[validPrimaryKey](a, b);
    if (primaryComparison === 0 && secondarySortKey) {
      const secondaryComparison = secondaryDirectionFactor * sortFunctions[validSecondaryKey](a, b);
      if (secondaryComparison === 0 && tertiarySortKey) {
        const tertiaryComparison = tertiaryDirectionFactor * sortFunctions[validTertiaryKey](a, b);
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

/**
 * Creates sort functions for different field types with configurable options.
 * @param sortNumbersFirst - Whether to sort numeric prefixes before alphabetic ones
 * @param ignoreLeadingArticles - Whether to ignore leading articles in comparisons
 * @returns Object containing sort functions for each field type
 */

const getSortFunctions = (sortNumbersFirst: boolean, ignoreLeadingArticles: boolean): Record<string, SortFunction> => {
  // Create string field comparer
  const createStringFieldComparer = (field: keyof Entry, isArticleAware: boolean): SortFunction => {
    return (a, b) => {
      const aValue = (a[field] as string) ?? '';
      const bValue = (b[field] as string) ?? '';

      // Only apply article handling for article-aware fields
      return isArticleAware
        ? compareStringsWithArticles(aValue, bValue, ignoreLeadingArticles, sortNumbersFirst)
        : compareStringsWithArticles(aValue, bValue, false, sortNumbersFirst); // No articles but still handle number sorting
    };
  };

  // Base sort functions
  const baseFunctions: Record<string, SortFunction> = {
    // String fields with article awareness
    album: createStringFieldComparer('album', true),
    artist: createStringFieldComparer('artist', true),
    title: createStringFieldComparer('title', true),
    genre: createStringFieldComparer('genre', true),

    // String fields without article awareness
    codec: createStringFieldComparer('codec', false),
    country: createStringFieldComparer('country', false),
    kind: createStringFieldComparer('kind', false),

    // Boolean fields
    isFavourite: (a, b) => {
      const aFav = a.isFavourite ? 1 : 0;
      const bFav = b.isFavourite ? 1 : 0;
      // return aFav - bFav;
      return bFav - aFav;
    },

    // Number fields
    bitrate: (a, b) => (a.bitrate ?? 0) - (b.bitrate ?? 0),
    discNumber: (a, b) => (a.discNumber ?? 0) - (b.discNumber ?? 0),
    duration: (a, b) => (a.duration ?? 0) - (b.duration ?? 0),
    sortOrder: (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    totalTracks: (a, b) => (a.totalTracks ?? 0) - (b.totalTracks ?? 0),
    trackNumber: (a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0),
    userRating: (a, b) => (a.userRating ?? 0) - (b.userRating ?? 0),

    // Date fields
    addedAt: (a, b) => new Date(a.addedAt ?? '1970-01-01').getTime() - new Date(b.addedAt ?? '1970-01-01').getTime(),
    lastPlayed: (a, b) =>
      new Date(a.lastPlayed ?? '1970-01-01').getTime() - new Date(b.lastPlayed ?? '1970-01-01').getTime(),
    releaseDate: (a, b) =>
      new Date(a.releaseDate ?? '1970-01-01').getTime() - new Date(b.releaseDate ?? '1970-01-01').getTime(),
  };

  // If sortNumbersFirst is false, we don't need special handling since that's the default
  if (sortNumbersFirst) {
    // Create enhanced string comparers with number-first handling
    const createNumberFirstComparer = (field: keyof Entry): SortFunction => {
      return (a, b) => {
        const aValue = (a[field] as string) ?? '';
        const bValue = (b[field] as string) ?? '';

        let valueA = aValue.toUpperCase();
        let valueB = bValue.toUpperCase();

        const isArticleAware = ARTICLE_AWARE_FIELDS.includes(field as string);

        // Apply article handling if needed
        if (ignoreLeadingArticles && isArticleAware) {
          valueA = removeLeadingArticle(valueA).toUpperCase();
          valueB = removeLeadingArticle(valueB).toUpperCase();
        }

        // Check for leading numbers
        const isFirstCharNumberA = valueA.length > 0 && !isNaN(Number(valueA[0]));
        const isFirstCharNumberB = valueB.length > 0 && !isNaN(Number(valueB[0]));

        // One has number, one doesn't
        if (isFirstCharNumberA && !isFirstCharNumberB) {
          return -1; // Numbers first
        }
        if (!isFirstCharNumberA && isFirstCharNumberB) {
          return 1; // Numbers first
        }

        // Both start with numbers
        if (isFirstCharNumberA && isFirstCharNumberB) {
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

        // Use standard string comparison with article handling for the rest
        return isArticleAware
          ? compareStringsWithArticles(aValue, bValue, ignoreLeadingArticles)
          : valueA.localeCompare(valueB);
      };
    };

    // Override string comparers with number-first versions
    return {
      ...baseFunctions,
      album: createNumberFirstComparer('album'),
      artist: createNumberFirstComparer('artist'),
      codec: createNumberFirstComparer('codec'),
      country: createNumberFirstComparer('country'),
      genre: createNumberFirstComparer('genre'),
      kind: createNumberFirstComparer('kind'),
      title: createNumberFirstComparer('title'),
    };
  }

  return baseFunctions;
};

/**
 * Removes leading articles (A, An, The) from a string.
 * @param str - String to process
 * @returns String with leading article removed, or original string if no article found
 */

const removeLeadingArticle = (str: string): string => {
  const normalizedStr = str.toUpperCase();
  for (const article of LEADING_ARTICLES) {
    if (normalizedStr.startsWith(article.toUpperCase() + ' ')) {
      return str.substring(article.length + 1).trim();
    }
  }
  return str;
};

/**
 * Compares two strings with optional article handling and numeric sorting preferences.
 * @param strA - First string to compare
 * @param strB - Second string to compare
 * @param ignoreLeadingArticles - Whether to ignore leading articles in comparison
 * @param sortNumbersFirst - Whether to sort numeric prefixes before alphabetic ones
 * @returns Negative, zero, or positive number indicating sort order
 */

const compareStringsWithArticles = (
  strA: string,
  strB: string,
  ignoreLeadingArticles: boolean = true,
  sortNumbersFirst: boolean = false
): number => {
  let valueA = strA.toUpperCase();
  let valueB = strB.toUpperCase();

  // Store original values for secondary sorting
  const originalA = valueA;
  const originalB = valueB;

  if (ignoreLeadingArticles) {
    valueA = removeLeadingArticle(valueA).toUpperCase();
    valueB = removeLeadingArticle(valueB).toUpperCase();

    // If they're equal after removing articles, prefer the one without article
    if (valueA === valueB) {
      const aHasArticle = originalA !== valueA;
      const bHasArticle = originalB !== valueB;
      if (aHasArticle && !bHasArticle) return 1; // b comes first
      if (!aHasArticle && bHasArticle) return -1; // a comes first
    }
  }

  // Check for leading numbers - do this AFTER article removal
  const isFirstCharNumberA = valueA.length > 0 && !isNaN(Number(valueA[0]));
  const isFirstCharNumberB = valueB.length > 0 && !isNaN(Number(valueB[0]));

  // If sortNumbersFirst is false (default), put numbers last
  if (!sortNumbersFirst) {
    if (isFirstCharNumberA && !isFirstCharNumberB) {
      return 1; // Letters first, numbers last
    }
    if (!isFirstCharNumberA && isFirstCharNumberB) {
      return -1; // Letters first, numbers last
    }
  }

  return valueA.localeCompare(valueB, undefined, { numeric: true });
};

export default sortList;
