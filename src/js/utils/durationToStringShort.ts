import moment from 'moment';

/**
 * Converts a duration in milliseconds to a short time string format.
 * @param durationMillisecs - Duration in milliseconds
 * @returns Formatted time string (e.g., "3:45", "1:23:45") or "0:00" for invalid input
 */

const durationToStringShort = (durationMillisecs: number): string => {
  // Handle negative durations and special cases by returning a default value
  if (durationMillisecs < 0 || isNaN(durationMillisecs) || !isFinite(durationMillisecs)) {
    return '0:00';
  }

  const duration = moment.duration(durationMillisecs, 'milliseconds');
  const hours = Math.floor(duration.asHours());
  const minutes = Math.floor(duration.asMinutes()) % 60;
  const seconds = Math.floor(duration.asSeconds()) % 60;

  let durationString = `${minutes}:${String(seconds).padStart(2, '0')}`;
  if (hours > 0) {
    durationString = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return durationString;
};

export default durationToStringShort;
