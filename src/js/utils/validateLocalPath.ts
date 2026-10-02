/**
 * Validates a user-provided local folder path for loading tag images in the Electron app: must be an absolute
 * path ending in a trailing slash, since it's used as a prefix directly in front of an image filename.
 * @param path - The path as currently typed (untrimmed)
 * @returns An error message to display, or null if the path is valid
 */

const validateLocalPath = (path: string): string | null => {
  const trimmedPath = path.trim();

  if (!trimmedPath) {
    return 'Path is required';
  }

  // accepts a POSIX absolute path (/Users/...), a Windows drive path (C:\Users\... or C:/Users/...), or a Windows
  // network share (\\server\share\...)
  const isAbsolute = /^\/|^[a-zA-Z]:[/\\]|^\\\\[^\\/]+[\\/][^\\/]+/.test(trimmedPath);
  if (!isAbsolute) {
    return 'Path must be absolute';
  }

  if (!trimmedPath.endsWith('/') && !trimmedPath.endsWith('\\')) {
    return 'Path must end with a / or \\';
  }

  return null;
};

export default validateLocalPath;
