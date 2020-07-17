import axios from 'axios';
import moment from 'moment';

export async function fetchData(url, config) {
  try {
    let res = await axios.get(url, config);
    return res.data;
  } catch (err) {
    console.log(err);
    throw Error(`Unable to fetch data at this time.`);
  }
}

export const formatDate = dateObj => {
  const year = dateObj.getFullYear().toString().split('').slice(2).join('');
  let month = dateObj.getMonth() + 1;
  let day = dateObj.getDate();
  let hour = dateObj.getHours();
  let minutes = dateObj.getMinutes();
  const daytime = hour < 12 ? 'am' : 'pm';

  // if (month < 10) {
  //    month = `0${month}`;
  // }

  if (day < 10) {
    day = `0${day}`;
  }

  if (hour > 12) {
    hour = hour - 12;
  }

  if (hour === 0) {
    hour = 12;
  }

  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  return `${month}/${day}/${year} at ${hour}:${minutes}${daytime}`;
};

export const formatAge = hrs => {
  let days = Math.floor(hrs / 24);
  let hoursMinutes;

  if (hrs === 0) {
    return '00:00 hrs';
  }

  if (days > 0) {
    let remainder = hrs % 24;
    let plural = days > 1;
    hoursMinutes = moment.duration(remainder, 'hours').format('hh:mm');
    return `${days} ${plural ? 'days' : 'day'} ${remainder !== 0 ? hoursMinutes : ''}`;
  } else {
    hoursMinutes = moment.duration(hrs, 'hours').format('hh:mm');
    return `${hoursMinutes} hrs`;
  }
};

export const randomizePanels = panelNames => {
  let displayPanels = [];

  while (displayPanels.length < 4) {
    let remainingIndexes = panelNames.length;
    let randomIndex = Math.floor(Math.random() * Math.floor(remainingIndexes));
    let removed = panelNames.splice(randomIndex, 1)[0];
    displayPanels.push(removed);
  }

  return displayPanels;
};
