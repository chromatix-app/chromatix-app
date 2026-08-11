const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const LEADING_TRAILING_HYPHENS = /^-+|-+$/g;

/**
 * Converts a tag name into a consistent lowercase, hyphenated slug for use as a filename:
 * lowercases, replaces "&" with "and", and collapses any other non-alphanumeric characters into hyphens.
 * @param tag - The tag name to slugify
 * @returns The slugified tag name
 */

const slugifyTagName = (tag: string): string =>
  tag.toLowerCase().replace(/&/g, 'and').replace(NON_ALPHANUMERIC, '-').replace(LEADING_TRAILING_HYPHENS, '');

export default slugifyTagName;
