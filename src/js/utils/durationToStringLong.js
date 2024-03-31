import moment from 'moment';

const durationToStringLong = (durationMillisecs) => {
  const duration = moment.duration(durationMillisecs, 'milliseconds');
  const days = Math.floor(duration.asDays());
  let hours = Math.floor(duration.asHours()) - days * 24;
  let minutes = Math.floor(duration.asMinutes()) - (days * 24 * 60 + hours * 60);

  if (days > 0) {
    // If there are any minutes, round to the closest hour
    if (minutes >= 30) {
      hours += 1;
    }
    minutes = 0; // Omit minutes from the string
  }

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
