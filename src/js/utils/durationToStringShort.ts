import moment from 'moment';

const durationToStringShort = (durationMillisecs: number): string => {
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
