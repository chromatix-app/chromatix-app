import moment from 'moment';

/**
 * Converts a timestamp to a human-readable relative time string.
 * Shows relative time for recent dates, absolute date for older entries.
 * @param addedAtSecs - Unix timestamp in seconds
 * @returns Formatted time string (e.g., "5 minutes ago", "2 days ago", "15 Jan 2024")
 */

const addedAtToString = (addedAtSecs: number): string => {
  const addedAtMoment = moment(addedAtSecs * 1000);
  const now = moment();
  const diffInMinutes = now.diff(addedAtMoment, 'minutes');
  const diffInHours = now.diff(addedAtMoment, 'hours');
  const diffInDays = now.diff(addedAtMoment, 'days');
  const diffInWeeks = now.diff(addedAtMoment, 'weeks');

  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  } else if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`;
  } else {
    return addedAtMoment.format('D MMM YYYY');
  }
};

export default addedAtToString;
