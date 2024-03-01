const getTimeDifference = (minutes, date) => {
  const previousDate = new Date(date);
  const currentDate = new Date();

  const timeDifferenceInMilliseconds = Math.abs(currentDate - previousDate);

  const minutesDifference = Math.floor(
    timeDifferenceInMilliseconds / (1000 * 60)
  );

  if (minutesDifference > minutes) {
    return false;
  } else {
    return true;
  }
};

module.exports = getTimeDifference;
