import moment from 'moment';

const durationToStringLong = (durationMillisecs) => {
  const duration = moment.duration(durationMillisecs, 'milliseconds');
  const days = Math.floor(duration.asDays());
  const hours = Math.floor(duration.asHours()) - days * 24;
  const minutes = Math.floor(duration.asMinutes()) - (days * 24 * 60 + hours * 60);

  let result = '';
  if (days > 0) {
    result += `${days} day${days > 1 ? 's' : ''} `;
  }
  if (hours > 0) {
    result += `${hours} hour${hours > 1 ? 's' : ''} `;
  }
  if (minutes > 0) {
    result += `${minutes} min${minutes > 1 ? 's' : ''}`;
  }
  return result.trim();
};

export default durationToStringLong;
