/**
 * Safely decodes a string that was encoded with safeEncodeURIComponent
 *
 * @param str - The encoded string to decode
 * @returns The decoded string
 */

const safeDecodeURIComponent = (str: string): string => {
  if (!str) return '';

  try {
    // First decode with standard method
    let decoded = decodeURIComponent(str);

    // Replace placeholders with the actual characters
    decoded = decoded
      .replace(/__AMP__/g, '&')
      .replace(/__COL__/g, ':')
      .replace(/__EQ__/g, '=')
      .replace(/__HASH__/g, '#')
      .replace(/__PCT__/g, '%')
      .replace(/__PLUS__/g, '+')
      .replace(/__QST__/g, '?')
      .replace(/__SLSH__/g, '/')
      .replace(/__SP__/g, ' ');

    return decoded;
  } catch (error) {
    // console.error('Error decoding URI component:', error);
    return str; // Return original string if decoding fails
  }
};

export default safeDecodeURIComponent;
