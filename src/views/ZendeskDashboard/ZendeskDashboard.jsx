import React, { useState, useEffect } from 'react';
import './ZendeskDashboard.scss';
import { fetchData } from '../../helperFunctions';

import { Link } from 'react-router-dom';

export default function ZendeskDashboard(props) {
	const [countByAgent, setCountByAgent] = useState();
	const [countByOrganization, setCountByOrganization] = useState();
	const [countByStatus, setCountByStatus] = useState();
	const [countByAge, setCountByAge] = useState();

	useEffect(() => {
		const config = {
			headers: {
				"Authorization": "Basic bGFuZUBtb2JpbHNlbnNlLmNvbS90b2tlbjp2WFI4UHdSbXdrVXBsQnBPbXdTSmxXWlNxR1N1Qlh3UUhBOEtpNWtK"
			}
		};

		fetchData('https://stuckorders.mobilsense.com/svc/tickets')
			.then(res => {
				console.log(res)
			})
			.catch(err => console.log(err));
	}, []);

	return (
		<div className='dashboard'>
			<Link to='/'>
				<i className="fas fa-arrow-left zendesk-back-arrow"></i>
			</Link>
		</div>
	)
};
