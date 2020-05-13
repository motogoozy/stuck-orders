import React, { useState, useEffect } from 'react';
import './ZendeskDashboard.scss';
import { fetchData } from '../../helperFunctions';
import TicketCountByAgent from '../../components/panels/TicketCountByAgent/TicketCountByAgent';
import TicketCountByOrganization from '../../components/panels/TicketCountByOrganization/TicketCountByOrganization';
import TicketCountByStatus from '../../components/panels/TicketCountByStatus/TicketCountByStatus';
import TicketCountByAge from '../../components/panels/TicketCountByAge/TicketCountByAge';

import { Link } from 'react-router-dom';
import moment from 'moment';
import GridLoader from 'react-spinners/GridLoader';

export const getCountByAgent = (ticketData) => {
	let agents = {};
	ticketData.forEach(ticket => {
		agents[ticket.agent] = agents[ticket.agent] || {'agent': ticket.agent, 'Count': 0};
		agents[ticket.agent].Count++;
	})

	let agentsArr = [];
	for (let agent in agents) {
		agentsArr.push(agents[agent]);
	}

	let sortedAgentsArr = agentsArr.sort((a, b) => {
		if (a.agent > b.agent) return 1;
		else if (a.agent < b.agent) return -1;
		return 0;
	})

	return sortedAgentsArr;
};

export const getCountByOrg = (ticketData) => {
	let orgs = {};
	ticketData.forEach(ticket => {
		orgs[ticket.organization] = orgs[ticket.organization] || {'organization': ticket.organization, 'Count': 0};
		orgs[ticket.organization].Count++;
	})

	let orgsArr = [];
	for (let organization in orgs) {
		orgsArr.push(orgs[organization]);
	}

	let sortedOrgsArr = orgsArr.sort((a, b) => {
		if (a.organization > b.organization) return 1;
		else if (a.organization < b.organization) return -1;
		return 0;
	})

	return sortedOrgsArr;
};

export const getCountByStatus = (ticketData) => {
	let statuses = {};
	ticketData.forEach(ticket => {
		statuses[ticket.status] = statuses[ticket.status] || {'status': ticket.status, 'Count': 0};
		statuses[ticket.status].Count++;
	})

	let statusesArr = [];
	for (let status in statuses) {
		statusesArr.push(statuses[status]);
	}

	let sortedStatusesArr = statusesArr.sort((a, b) => {
		if (a.status > b.status) return 1;
		else if (a.status < b.status) return -1;
		return 0;
	})

	return sortedStatusesArr;
};

export const getCountByAge = (ticketData) => {
	let ages = {};
	let maxAge = 0;
	ticketData.forEach(ticket => {
		const now = moment();
		const createdAt = moment(new Date(ticket.created_at));
		const difference = now.diff(createdAt, 'days');
		(difference > maxAge) && (maxAge = difference);
		
		ages[difference.toString()] = ages[difference.toString()] || {'age': difference.toString(), 'Day': 0};
		ages[difference.toString()].Day++;
	})

	let agesArr = [];
	for (let age in ages) {
		agesArr.push(ages[age]);
	}
	for (let i = 0; i <= maxAge; i++) {
		if (!ages[i.toString()]) {
			agesArr.push({'age': i.toString(), 'Day': 0});
		}
	}

	let sortedAgesArr = agesArr.sort((a, b) => {
		if (parseInt(a.age) > parseInt(b.age)) return 1;
		else if (parseInt(a.age) < parseInt(b.age)) return -1;
		return 0;
	})

	return sortedAgesArr;
};

export default function ZendeskDashboard(props) {
	const [ticketData, setTicketData] = useState();
	const [countByAgent, setCountByAgent] = useState();
	const [countByOrganization, setCountByOrganization] = useState();
	const [countByStatus, setCountByStatus] = useState();
	const [countByAge, setCountByAge] = useState();

	useEffect(() => {
		fetchData('/svc/tickets')
			.then(data => {
				setTicketData(data.tickets);
			})
			.catch(err => console.log(err));
	}, []);

	useEffect(() => {
		if (ticketData) {
			const agentData = getCountByAgent(ticketData);
			const orgData = getCountByOrg(ticketData);
			const statusData = getCountByStatus(ticketData);
			const ageData = getCountByAge(ticketData);

			setCountByAgent(agentData);
			setCountByOrganization(orgData);
			setCountByStatus(statusData);
			setCountByAge(ageData);
		}
	}, [ticketData]);

	return (
		<div className='dashboard'>
			<Link to='/'>
				<i className="fas fa-arrow-left zendesk-back-arrow"></i>
			</Link>
			
			<div className='dashboard-panel'>
				{
               ticketData
               ?
               <>
                  <p className='panel-header'>Tickets by Agent</p>
                  <div className='chart-container'>
                     <TicketCountByAgent countByAgent={countByAgent} />
                  </div>
               </>
               :
               <div className='grid-loader-container'>
                  <GridLoader size={12} loading={true} color={'#A5368D'} />
               </div>
            }
			</div>

			<div className='dashboard-panel'>
				{
               ticketData
               ?
               <>
                  <p className='panel-header'>Tickets by Organization</p>
                  <div className='chart-container'>
                     <TicketCountByOrganization countByOrganization={countByOrganization} />
                  </div>
               </>
               :
               <div className='grid-loader-container'>
                  <GridLoader size={12} loading={true} color={'#800026'} />
               </div>
            }
			</div>

			<div className='dashboard-panel'>
				{
               ticketData
               ?
               <>
                  <p className='panel-header'>Tickets by Status</p>
                  <div className='chart-container'>
                     <TicketCountByStatus countByStatus={countByStatus} />
                  </div>
               </>
               :
               <div className='grid-loader-container'>
                  <GridLoader size={12} loading={true} color={'#3690C0'} />
               </div>
            }
			</div>
			
			<div className='dashboard-panel'>
				{
               ticketData
               ?
               <>
                  <p className='panel-header'>Tickets by Age</p>
                  <div className='chart-container'>
                     <TicketCountByAge countByAge={countByAge} />
                  </div>
               </>
               :
               <div className='grid-loader-container'>
                  <GridLoader size={12} loading={true} color={'#016C59'} />
               </div>
            }
			</div>
		</div>
	)
};
