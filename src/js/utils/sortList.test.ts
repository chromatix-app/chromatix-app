import sortList from './sortList';

describe('Testing "sortList" function', () => {
  const entries = [
    { title: 'Song A', duration: 200, artist: 'Artist A', releaseDate: '2021-01-01' },
    { title: 'Song B', duration: 150, artist: 'Artist B', releaseDate: '2019-01-01' },
    { title: 'Song C', duration: 180, artist: 'Artist C', releaseDate: '2020-01-01' },
  ];

  // TITLE

  test('Test sorting by title ascending', () => {
    const sorted = sortList({ entries, options: 'title-asc' });
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song C');
  });

  test('Test sorting by title descending', () => {
    const sorted = sortList({ entries, options: 'title-asc', direction: 'desc' });
    expect(sorted[0].title).toBe('Song C');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song A');
  });

  test('Test sorting by title descending', () => {
    const sorted = sortList({ entries, options: 'title-desc' });
    expect(sorted[0].title).toBe('Song C');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song A');
  });

  // DURATION

  test('Test simple duration ascending', () => {
    const sorted = sortList({ entries, options: 'duration-asc' });
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song A');
  });

  test('Test simple duration descending', () => {
    const sorted = sortList({ entries, options: 'duration-asc', direction: 'desc' });
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song B');
  });

  test('Test simple duration descending', () => {
    const sorted = sortList({ entries, options: 'duration-desc' });
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song B');
  });

  test('Test sorting with primary and secondary keys', () => {
    const entriesWithSameDuration = [
      { title: 'Song A', duration: 200, artist: 'Artist B' },
      { title: 'Song B', duration: 200, artist: 'Artist A' },
      { title: 'Song C', duration: 150, artist: 'Artist C' },
    ];
    const sorted = sortList({ entries: entriesWithSameDuration, options: 'duration-asc-artist-asc' });
    expect(sorted[0].title).toBe('Song C');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song A');
  });

  // ARTIST

  test('Test sorting by artist ascending', () => {
    const sorted = sortList({ entries, options: 'artist-asc' });
    expect(sorted[0].artist).toBe('Artist A');
    expect(sorted[1].artist).toBe('Artist B');
    expect(sorted[2].artist).toBe('Artist C');
  });

  test('Test sorting by artist descending', () => {
    const sorted = sortList({ entries, options: 'artist-desc' });
    expect(sorted[0].artist).toBe('Artist C');
    expect(sorted[1].artist).toBe('Artist B');
    expect(sorted[2].artist).toBe('Artist A');
  });

  // RELEASE DATE

  test('Test sorting by releaseDate ascending', () => {
    const sorted = sortList({ entries, options: 'releaseDate-asc' });
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song A');
  });

  test('Test sorting by releaseDate descending', () => {
    const sorted = sortList({ entries, options: 'releaseDate-desc' });
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song B');
  });

  // ALBUM

  test('Test sorting by album ascending', () => {
    const entriesWithAlbums = [
      { title: 'Song A', album: 'Album B' },
      { title: 'Song B', album: 'Album A' },
      { title: 'Song C', album: 'Album C' },
    ];
    const sorted = sortList({ entries: entriesWithAlbums, options: 'album-asc' });
    expect(sorted[0].album).toBe('Album A');
    expect(sorted[1].album).toBe('Album B');
    expect(sorted[2].album).toBe('Album C');
  });

  // GENRE

  test('Test sorting by genre descending', () => {
    const entriesWithGenres = [
      { title: 'Song A', genre: 'Rock' },
      { title: 'Song B', genre: 'Jazz' },
      { title: 'Song C', genre: 'Pop' },
    ];
    const sorted = sortList({ entries: entriesWithGenres, options: 'genre-desc' });
    expect(sorted[0].genre).toBe('Rock');
    expect(sorted[1].genre).toBe('Pop');
    expect(sorted[2].genre).toBe('Jazz');
  });

  // MISSING FIELDS

  test('Test sorting with missing fields', () => {
    const entriesWithMissingFields = [
      { title: 'Song A', duration: 200 },
      { title: 'Song B' },
      { title: 'Song C', duration: 180 },
    ];
    const sorted = sortList({ entries: entriesWithMissingFields, options: 'duration-asc' });
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song A');
  });

  // EMPTY ARRAY

  test('Test sorting with empty array', () => {
    const sorted = sortList({ entries: [], options: 'title-asc' });
    expect(sorted).toEqual([]);
  });

  // SINGLE ENTRY

  test('Test sorting with single entry', () => {
    const singleEntry = [{ title: 'Song A', duration: 200 }];
    const sorted = sortList({ entries: singleEntry, options: 'duration-asc' });
    expect(sorted).toEqual(singleEntry);
  });

  // INVALID SORT KEY

  test('Test sorting with invalid sort key', () => {
    const sorted = sortList({ entries, options: 'invalidKey-asc' });
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song C');
  });

  // SORT NUMBERS LAST

  test('Test sorting with sortNumbersLast option', () => {
    const entriesWithMixedTitles = [{ title: 'Song A' }, { title: '1 Song' }, { title: '2 Song' }];
    const sorted = sortList({
      entries: entriesWithMixedTitles,
      options: 'title-asc',
    });
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('1 Song');
    expect(sorted[2].title).toBe('2 Song');
  });

  // SORT NUMBERS FIRST OPTION

  test('Test sorting with sortNumbersFirst option', () => {
    const entriesWithMixedTitles = [{ title: 'Song A' }, { title: '1 Song' }, { title: '2 Song' }];
    const sorted = sortList({
      entries: entriesWithMixedTitles,
      options: 'title-asc',
      sortNumbersFirst: true,
    });
    expect(sorted[0].title).toBe('1 Song');
    expect(sorted[1].title).toBe('2 Song');
    expect(sorted[2].title).toBe('Song A');
  });
});
