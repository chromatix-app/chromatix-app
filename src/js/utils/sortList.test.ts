import sortList from './sortList';

describe('Testing "sortList" function', () => {
  const entries = [
    { title: 'Song A', duration: 200, artist: 'Artist A', releaseDate: '2021-01-01' },
    { title: 'Song B', duration: 150, artist: 'Artist B', releaseDate: '2019-01-01' },
    { title: 'Song C', duration: 180, artist: 'Artist C', releaseDate: '2020-01-01' },
  ];

  // TITLE

  test('Test sorting by title ascending', () => {
    const sorted = sortList(entries, 'title-asc');
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song C');
  });

  test('Test sorting by title descending', () => {
    const sorted = sortList(entries, 'title-asc', 'desc');
    expect(sorted[0].title).toBe('Song C');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song A');
  });

  test('Test sorting by title descending', () => {
    const sorted = sortList(entries, 'title-desc');
    expect(sorted[0].title).toBe('Song C');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song A');
  });

  // DURATION

  test('Test simple duration ascending', () => {
    const sorted = sortList(entries, 'duration-asc');
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song A');
  });

  test('Test simple duration descending', () => {
    const sorted = sortList(entries, 'duration-asc', 'desc');
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song B');
  });

  test('Test simple duration descending', () => {
    const sorted = sortList(entries, 'duration-desc');
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
    const sorted = sortList(entriesWithSameDuration, 'duration-asc-artist-asc');
    expect(sorted[0].title).toBe('Song C');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song A');
  });

  // ARTIST

  test('Test sorting by artist ascending', () => {
    const sorted = sortList(entries, 'artist-asc');
    expect(sorted[0].artist).toBe('Artist A');
    expect(sorted[1].artist).toBe('Artist B');
    expect(sorted[2].artist).toBe('Artist C');
  });

  test('Test sorting by artist descending', () => {
    const sorted = sortList(entries, 'artist-desc');
    expect(sorted[0].artist).toBe('Artist C');
    expect(sorted[1].artist).toBe('Artist B');
    expect(sorted[2].artist).toBe('Artist A');
  });

  // RELEASE DATE

  test('Test sorting by releaseDate ascending', () => {
    const sorted = sortList(entries, 'releaseDate-asc');
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song B');
  });

  test('Test sorting by releaseDate descending', () => {
    const sorted = sortList(entries, 'releaseDate-desc');
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song A');
  });

  // ALBUM

  test('Test sorting by album ascending', () => {
    const entriesWithAlbums = [
      { title: 'Song A', album: 'Album B' },
      { title: 'Song B', album: 'Album A' },
      { title: 'Song C', album: 'Album C' },
    ];
    const sorted = sortList(entriesWithAlbums, 'album-asc');
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
    const sorted = sortList(entriesWithGenres, 'genre-desc');
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
    const sorted = sortList(entriesWithMissingFields, 'duration-asc');
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song A');
  });

  // EMPTY ARRAY

  test('Test sorting with empty array', () => {
    const sorted = sortList([], 'title-asc');
    expect(sorted).toEqual([]);
  });

  // SINGLE ENTRY

  test('Test sorting with single entry', () => {
    const singleEntry = [{ title: 'Song A', duration: 200 }];
    const sorted = sortList(singleEntry, 'duration-asc');
    expect(sorted).toEqual(singleEntry);
  });

  // INVALID SORT KEY

  test('Test sorting with invalid sort key', () => {
    const sorted = sortList(entries, 'invalidKey-asc');
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song C');
  });
});
