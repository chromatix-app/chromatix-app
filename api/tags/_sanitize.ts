// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS = /[\x00-\x1f\x7f]/g;

export const MAX_TAG_LENGTH = 128;

/**
 * Trims a tag name and strips control characters, preserving original casing
 * and all other characters (accents, punctuation, emoji, symbols).
 */
export function sanitizeTagName(name: string): string {
  return name.replace(CONTROL_CHARACTERS, '').trim();
}
