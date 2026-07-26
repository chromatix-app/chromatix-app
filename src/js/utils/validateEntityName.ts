const UNSAFE_CHARACTERS = /[\\/:*?"<>|]/g;

/**
 * Validates a playlist/collection name for creation or editing: trims whitespace, checks length,
 * rejects filesystem-unsafe characters, and checks for a case-insensitive duplicate name.
 * @param name - The name as currently typed (untrimmed)
 * @param existingNames - Names of other playlists/collections already on the server
 * @param currentName - When editing, the item's current name, so renaming to the same name is allowed
 * @returns An error message to display, or null if the name is valid
 */

const validateEntityName = (name: string, existingNames: string[], currentName?: string): string | null => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return 'Name is required';
  }
  if (trimmedName.length > 128) {
    return 'Name must be 128 characters or fewer';
  }
  const unsafeCharactersFound = [...new Set(trimmedName.match(UNSAFE_CHARACTERS))];
  if (unsafeCharactersFound.length) {
    return `Name cannot contain ${unsafeCharactersFound.join(' ')}`;
  }

  const isUnchanged = currentName && trimmedName.toLowerCase() === currentName.trim().toLowerCase();
  const isDuplicate = existingNames.some(
    (existingName) => existingName.trim().toLowerCase() === trimmedName.toLowerCase()
  );
  if (!isUnchanged && isDuplicate) {
    return 'Name already in use';
  }

  return null;
};

export default validateEntityName;
