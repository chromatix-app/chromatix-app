const sortList = (entry, sortKey) => {
  const sortKeyArray = sortKey.split('-');
  const primarySortKey = sortKeyArray[0];
  const secondarySortKey = sortKeyArray[1] || 'title';

  return entry.sort((a, b) => {
    const primaryComparison = sortFunctions[primarySortKey](a, b);
    if (primaryComparison === 0 && secondarySortKey) {
      return sortFunctions[secondarySortKey](a, b);
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
  releaseDateDesc: (a, b) => new Date(a.releaseDate || '1970-01-01') - new Date(b.releaseDate || '1970-01-01'),
  addedAt: (a, b) => new Date(b.addedAt || '1970-01-01') - new Date(a.addedAt || '1970-01-01'),
  lastPlayed: (a, b) => new Date(b.lastPlayed || '1970-01-01') - new Date(a.lastPlayed || '1970-01-01'),
};

export default sortList;
