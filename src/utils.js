import axios from 'axios';

export const formatDate = (dateObj) => {
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

export async function fetchData (url, config) {
	try {
		let res = await axios.get(url, config);
		return res.data;
	} catch (err) {
		console.log(err);
		throw Error(`Unable to fetch data at this time.`);
	}
};