/**
 * Converts a duration in milliseconds to a long descriptive format with full words.
 * Rounds to appropriate precision (seconds when < 1h, minutes when < 1d, hours when >= 1d).
 * @param durationMillisecs - Duration in milliseconds
 * @returns Formatted duration string (e.g., "45 secs", "3 mins, 45 secs", "2 hours, 30 mins", "1 day, 5 hours") or empty string for invalid input
 */

const durationToStringLong = (durationMillisecs: number): string => {
  // Handle negative durations and special cases by returning a default value
  if (durationMillisecs < 0 || isNaN(durationMillisecs) || !isFinite(durationMillisecs)) {
    return '';
  }

  const totalSeconds = Math.floor(durationMillisecs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  let hours = Math.floor(totalSeconds / 3600) - days * 24;
  let minutes = Math.floor(totalSeconds / 60) - (days * 24 * 60 + hours * 60);
  let seconds = totalSeconds - (days * 86400 + hours * 3600 + minutes * 60);

  if (hours > 0) {
    // If there are any seconds, round to the closest minute
    if (seconds >= 30) {
      minutes += 1;
    }
    seconds = 0; // Omit seconds from the string
  }

  if (days > 0) {
    // If there are any minutes, round to the closest hour
    if (minutes >= 30) {
      hours += 1;
    }
    minutes = 0; // Omit minutes from the string
  }

  const components = [];
  if (days > 0) {
    components.push(`${days} day${days > 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    components.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    components.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
  }
  if (seconds > 0) {
    components.push(`${seconds} sec${seconds > 1 ? 's' : ''}`);
  }

  return components.join(', ').trim();
};

export default durationToStringLong;
