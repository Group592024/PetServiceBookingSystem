export const formatDateString = (dateString) => {
  if (!dateString) return 'Invalid date';

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return 'Invalid date';

    const [fullDate, time] = dateString.split('T');

    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = date.toLocaleDateString('en-GB', options);

    if (time.startsWith('00:00:00')) {
      return formattedDate;
    }

    const formattedTime = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return `${formattedDate} ${formattedTime}`;
  } catch (error) {
    return 'Invalid date';
  }
};
