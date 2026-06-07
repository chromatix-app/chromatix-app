import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Formats a timestamp as a relative time string (e.g., "2 hours ago", "3 days ago").
 * @param timeStamp - Unix timestamp in seconds
 * @returns Formatted relative time string, or null if timestamp is invalid
 */

const formatRecentDate = (timeStamp: number): string | null => {
  if (!timeStamp) {
    return null;
  }

  const date = dayjs(timeStamp * 1000);

  if (!date.isValid()) {
    return null;
  }

  return date.fromNow();
};

export default formatRecentDate;
