import moment from 'moment';

const addedAtToString = (addedAtSecs) => {
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
