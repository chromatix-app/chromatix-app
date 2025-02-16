import moment from 'moment';

const durationToStringLong = (durationMillisecs: number): string => {
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

export default durationToStringLong;
