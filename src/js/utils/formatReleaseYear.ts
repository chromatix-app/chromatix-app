import moment from 'moment';

/**
 * Extracts the 4-digit release year from a date string.
 * Accepts ISO 8601 strings (e.g. "2001-01-01" or "2011-01-01T00:00:00.0000000Z").
 * @param releaseDate - Date string to parse
 * @returns 4-digit year string (e.g. "2001"), or null if input is falsy or invalid
 */

const formatReleaseYear = (releaseDate: string | null | undefined): string | null => {
  if (!releaseDate) {
    return null;
  }

  const parsed = moment(releaseDate);

  if (!parsed.isValid()) {
    return null;
  }

  return parsed.format('YYYY');
};

export default formatReleaseYear;
