// Generated using GitHub Copilot

import formatReleaseYear from './formatReleaseYear';

describe('Testing "formatReleaseYear" function', () => {
  test('Parses date-only ISO string', () => {
    expect(formatReleaseYear('2001-01-01')).toBe('2001');
    expect(formatReleaseYear('1969-12-31')).toBe('1969');
    expect(formatReleaseYear('2023-06-15')).toBe('2023');
  });

  test('Parses full ISO 8601 datetime string', () => {
    expect(formatReleaseYear('2011-01-01T00:00:00.0000000Z')).toBe('2011');
    expect(formatReleaseYear('1999-12-31T23:59:59.999Z')).toBe('1999');
    expect(formatReleaseYear('2024-03-20T14:30:00.000Z')).toBe('2024');
  });

  test('Returns null for falsy input', () => {
    expect(formatReleaseYear(null)).toBeNull();
    expect(formatReleaseYear(undefined)).toBeNull();
    expect(formatReleaseYear('')).toBeNull();
  });

  test('Returns null for invalid date strings', () => {
    expect(formatReleaseYear('not-a-date')).toBeNull();
    expect(formatReleaseYear('abcd-ef-gh')).toBeNull();
  });
});
