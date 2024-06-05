const sortList = (entry, options) => {
  const optionsArray = options.split('-');

  const primarySortKey = optionsArray[0];
  const primaryDirection = optionsArray[1] || 'asc';

  const secondarySortKey = optionsArray[2] || 'title';
  const secondaryDirection = optionsArray[3] || 'asc';

  return doSorting(entry, primarySortKey, secondarySortKey, primaryDirection, secondaryDirection);
};

const doSorting = (
  entry,
  primarySortKey,
  secondarySortKey = 'title',
  primaryDirection = 'asc',
  secondaryDirection = 'asc'
) => {
  primarySortKey = sortFunctions[primarySortKey] ? primarySortKey : 'title';
  secondarySortKey = sortFunctions[secondarySortKey] ? secondarySortKey : 'title';

  const primaryDirectionFactor = primaryDirection === 'asc' ? 1 : -1;
  const secondaryDirectionFactor = secondaryDirection === 'asc' ? 1 : -1;

  return entry.sort((a, b) => {
    const primaryComparison = primaryDirectionFactor * sortFunctions[primarySortKey](a, b);
    if (primaryComparison === 0 && secondarySortKey) {
      return secondaryDirectionFactor * sortFunctions[secondarySortKey](a, b);
    }
    return primaryComparison;
  });
};

const sortFunctions = {
  title: (a, b) => {
    const nameA = a.title.toUpperCase();
    const nameB = b.title.toUpperCase();
    if (!isNaN(nameA[0]) && isNaN(nameB[0])) {
      return 1;
    }
    if (isNaN(nameA[0]) && !isNaN(nameB[0])) {
      return -1;
    }
    return nameA.localeCompare(nameB);
  },
  artist: (a, b) => a.artist?.localeCompare(b.artist),
  userRating: (a, b) => (parseInt(b.userRating) || 0) - (parseInt(a.userRating) || 0),
  releaseDate: (a, b) => new Date(b.releaseDate || '1970-01-01') - new Date(a.releaseDate || '1970-01-01'),
  addedAt: (a, b) => new Date(b.addedAt || '1970-01-01') - new Date(a.addedAt || '1970-01-01'),
  lastPlayed: (a, b) => new Date(b.lastPlayed || '1970-01-01') - new Date(a.lastPlayed || '1970-01-01'),
};

export default sortList;
