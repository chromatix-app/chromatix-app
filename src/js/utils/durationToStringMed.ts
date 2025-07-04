import moment from 'moment';

/**
 * Converts a duration in milliseconds to a medium-length abbreviated format.
 * Rounds to appropriate precision (seconds when < 1h, minutes when < 1d, hours when >= 1d).
 * @param durationMillisecs - Duration in milliseconds
 * @returns Formatted duration string (e.g., "45s", "3m 45s", "2h 30m", "1d 5h") or empty string for invalid input
 */

const durationToStringMed = (durationMillisecs: number): string => {
  // Handle negative durations and special cases by returning a default value
  if (durationMillisecs < 0 || isNaN(durationMillisecs) || !isFinite(durationMillisecs)) {
    return '';
  }

  const duration = moment.duration(durationMillisecs, 'milliseconds');
  const days = Math.floor(duration.asDays());
  let hours = Math.floor(duration.asHours()) - days * 24;
  let minutes = Math.floor(duration.asMinutes()) - (days * 24 * 60 + hours * 60);
  let seconds = Math.floor(duration.asSeconds()) - (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60);

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
    components.push(`${days}d`);
  }
  if (hours > 0) {
    components.push(`${hours}h`);
  }
  if (minutes > 0) {
    components.push(`${minutes}m`);
  }
  if (seconds > 0) {
    components.push(`${seconds}s`);
  }

  return components.join(' ').trim();
};

export default durationToStringMed;
