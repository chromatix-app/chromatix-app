import moment from 'moment';

const formatRecentDate = (timeStamp) => {
  // Convert timestamp to milliseconds and create a moment object
  const timeMoment = moment(timeStamp * 1000);

  // Check if the date is valid
  if (!timeMoment.isValid()) {
    return null;
  }

  return timeMoment.fromNow();

  // // Calculate the difference in weeks
  // const weeksAgo = moment().diff(timeMoment, 'weeks');

  // if (weeksAgo > 4) {
  //   let formattedDate = timeMoment.format('Do MMM YYYY');
  //   const match = formattedDate.match(/(\d+)(st|nd|rd|th)/);

  //   if (match) {
  //     const [, number, suffix] = match;
  //     return (
  //       <>
  //         {formattedDate.slice(0, match.index)}
  //         {number}
  //         <sup>{suffix}</sup>
  //         {formattedDate.slice(match.index + match[0].length)}
  //       </>
  //     );
  //   } else {
  //     return formattedDate;
  //   }
  // } else {
  //   // Otherwise, return a relative time string
  //   return timeMoment.fromNow();
  // }
};

export default formatRecentDate;
