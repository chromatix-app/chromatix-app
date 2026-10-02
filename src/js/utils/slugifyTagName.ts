const DIACRITICS = /[̀-ͯ]/g;
const QUOTES = /['’‘"“”]/g;
const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const LEADING_TRAILING_HYPHENS = /^-+|-+$/g;

/**
 * Converts a tag name into a consistent lowercase, hyphenated slug for use as a filename:
 * strips accents/diacritics (e.g. "é" -> "e"), removes apostrophes/quotes entirely rather than
 * hyphenating them (so "80's" and "80s" produce the same slug), lowercases, replaces "&" with "-and-"
 * (surrounded by hyphens regardless of surrounding whitespace, so "R&B", "R & B", and "R& B" all produce
 * the same slug), and collapses any other non-alphanumeric characters into hyphens.
 * @param tag - The tag name to slugify
 * @returns The slugified tag name
 */
const slugifyTagName = (tag: string): string => {
  return tag
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(QUOTES, '')
    .toLowerCase()
    .replace(/&/g, '-and-')
    .replace(NON_ALPHANUMERIC, '-')
    .replace(LEADING_TRAILING_HYPHENS, '');
};

export default slugifyTagName;
