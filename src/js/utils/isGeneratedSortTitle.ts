const DIACRITICS = /\p{M}/gu;
const LEADING_ARTICLE = /^(a|an|the)\s+/;

const normalize = (value: string): string =>
  value.trim().normalize('NFD').replace(DIACRITICS, '').toLowerCase().replace(LEADING_ARTICLE, '');

/**
 * Checks whether a Plex `titleSort` is one Plex generated from the title rather than one set by
 * hand. Plex fills it in itself by removing a leading article ("The Offspring" -> "Offspring") or
 * accents ("Skeletá" -> "Skeleta"), so a value that matches the title once both are trimmed,
 * lowercased and stripped of accents and a leading "a", "an" or "the" is treated as generated.
 * @param title - The item's displayed title
 * @param titleSort - The item's sort title from Plex
 * @returns True if the sort title adds nothing beyond the title
 */
const isGeneratedSortTitle = (title: string, titleSort: string): boolean => {
  return normalize(title) === normalize(titleSort);
};

export default isGeneratedSortTitle;
