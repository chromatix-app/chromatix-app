import moment from 'moment';

const durationToStringShort = (durationMillisecs) => {
  const duration = moment.duration(durationMillisecs, 'milliseconds');
  const hours = Math.floor(duration.asHours());
  const minutes = Math.floor(duration.minutes());
  const seconds = duration.seconds();

  let durationString = `${minutes}:${String(seconds).padStart(2, '0')}`;
  if (hours > 0) {
    durationString = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return durationString;
};

export default durationToStringShort;
