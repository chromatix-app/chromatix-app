/**
 * Validates a user-provided base directory URL for loading remote tag images: must be a well-formed https:// URL
 * ending in a trailing slash, since it's used as a prefix directly in front of an image filename.
 * @param url - The URL as currently typed (untrimmed)
 * @returns An error message to display, or null if the URL is valid
 */

const validateHttpsUrl = (url: string): string | null => {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return 'URL is required';
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return 'Enter a valid URL';
  }

  if (parsedUrl.protocol !== 'https:') {
    return 'URL must start with https://';
  }

  if (!trimmedUrl.endsWith('/')) {
    return 'URL must end with a /';
  }

  return null;
};

export default validateHttpsUrl;
