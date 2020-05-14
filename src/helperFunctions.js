import axios from 'axios';

export async function fetchData (url, config) {
	try {
		let res = await axios.get(url, config);
		return res.data;
	} catch (err) {
		throw Error(`Unable to fetch data at this time.`);
	}
};