/**
 * Safely encodes a string for use in URLs, handling problematic characters
 * that might cause issues in React Router applications.
 *
 * @param str - The string to encode
 * @returns The safely encoded string
 */

const safeEncodeURIComponent = (str: string): string => {
  if (!str) return '';

  // First encode using standard method
  let encoded = encodeURIComponent(str);

  // Replace problematic characters with custom placeholders
  encoded = encoded
    .replace(/%26/g, '__AMP__')
    .replace(/%3A/g, '__COL__')
    .replace(/%3D/g, '__EQ__')
    .replace(/%23/g, '__HASH__')
    .replace(/%25/g, '__PCT__')
    .replace(/%2B/g, '__PLUS__')
    .replace(/%3F/g, '__QST__')
    .replace(/%2F/g, '__SLSH__')
    .replace(/%20/g, '__SP__');

  return encoded;
};

export default safeEncodeURIComponent;
