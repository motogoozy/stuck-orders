import React, { useState, useEffect } from 'react';
import './ZendeskDashboard.scss';
import { fetchData } from '../../helperFunctions';
import TicketCountByAgent from '../../components/panels/TicketCountByAgent/TicketCountByAgent';
import TicketCountByOrganization from '../../components/panels/TicketCountByOrganization/TicketCountByOrganization';
import TicketCountByStatus from '../../components/panels/TicketCountByStatus/TicketCountByStatus';
import TicketCountByAge from '../../components/panels/TicketCountByAge/TicketCountByAge';
import AgentCountByOrganization from '../../components/panels/AgentCountByOrganizationPanel/AgentCountByOrganizationPanel';

import { Link } from 'react-router-dom';
import moment from 'moment';
import GridLoader from 'react-spinners/GridLoader';

export const getTicketCountByAgent = (ticketData) => {
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

export const getTicketCountByOrg = (ticketData) => {
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

export const getTicketCountByStatus = (ticketData) => {
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

export const getTicketCountByAge = (ticketData) => {
	let ages = {};
	ticketData.forEach(ticket => {
		const now = moment();
		const createdAt = moment(new Date(ticket.created_at));
		const difference = now.diff(createdAt, 'days');

		if (difference < 8) {
			ages[difference.toString()] = ages[difference.toString()] || {'age': difference.toString(), 'Day': 0};
			ages[difference.toString()].Day++;
		} else {
			ages['8+'] = ages['8+'] || {'age': '8+', 'Day': 0};
			ages['8+'].Day++;
		}
	})

	let agesArr = [];
	for (let age in ages) {
		agesArr.push(ages[age]);
	}

	let sortedAgesArr = agesArr.sort((a, b) => {
		if (parseInt(a.age) > parseInt(b.age)) return 1;
		else if (parseInt(a.age) < parseInt(b.age)) return -1;
		return 0;
	})

	return sortedAgesArr;
};

export const getAgentCountByOrg = (ticketData) => {
	let orgs = {}; // map of organization names with array of agent names
	ticketData.forEach(ticket => {
		orgs[ticket.organization] = orgs[ticket.organization] || {organization: ticket.organization, agents: []};
		orgs[ticket.organization].agents.push(ticket.agent);
	})

	let orgsArr = [];
	for (let organization in orgs) {
		orgsArr.push({organization: orgs[organization].organization, 'Count': parseInt(orgs[organization].agents.length)});
	}

	let sortedOrgsArr = orgsArr.sort((a, b) => {
		if (a.organization > b.organization) return 1;
		else if (a.organization < b.organization) return -1;
		return 0;
	})

	return sortedOrgsArr;
};

export default function ZendeskDashboard(props) {
	const [ticketData, setTicketData] = useState();
	const [ticketCountByAgent, setTicketCountByAgent] = useState();
	const [ticketCountByOrganization, setTicketCountByOrganization] = useState();
	const [ticketCountByStatus, setTicketCountByStatus] = useState();
	const [ticketCountByAge, setTicketCountByAge] = useState();
	const [agentCountByOrganization, setAgentCountByOrganization] = useState();
	const [page, setPage] = useState(1);

	useEffect(() => {
		fetchData('/svc/tickets')
			.then(data => {
				setTicketData(data.tickets);
			})
			.catch(err => console.log(err));
	}, []);

	useEffect(() => {
		if (ticketData) {
			const ticketByAgentData = getTicketCountByAgent(ticketData);
			const ticketByOrgData = getTicketCountByOrg(ticketData);
			const ticketByStatusData = getTicketCountByStatus(ticketData);
			const ticketByAgeData = getTicketCountByAge(ticketData);
			const agentByOrgData = getAgentCountByOrg(ticketData);

			setTicketCountByAgent(ticketByAgentData);
			setTicketCountByOrganization(ticketByOrgData);
			setTicketCountByStatus(ticketByStatusData);
			setTicketCountByAge(ticketByAgeData);
			setAgentCountByOrganization(agentByOrgData);
		}
	}, [ticketData]);

	return (
		<div className='dashboard'>
			<Link to='/'>
				<i className="fas fa-arrow-left zendesk-back-arrow"></i>
			</Link>

			{
				page === 1
				&&
				<>
					<div className='dashboard-panel'>
						{
							ticketData
							?
							<>
								<p className='panel-header'>Tickets by Agent</p>
								<div className='chart-container'>
									<TicketCountByAgent ticketCountByAgent={ticketCountByAgent} />
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
									<TicketCountByOrganization ticketCountByOrganization={ticketCountByOrganization} />
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
									<TicketCountByStatus ticketCountByStatus={ticketCountByStatus} />
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
									<TicketCountByAge ticketCountByAge={ticketCountByAge} />
								</div>
							</>
							:
							<div className='grid-loader-container'>
								<GridLoader size={12} loading={true} color={'#016C59'} />
							</div>
						}
					</div>
				</>
			}
			
			{
				page === 2
				&&
				<>
					<div className='dashboard-panel'>
						{
							ticketData
							?
							<>
								<p className='panel-header'>Agents by Organization</p>
								<div className='chart-container'>
									<AgentCountByOrganization agentCountByOrganization={agentCountByOrganization} />
								</div>
							</>
							:
							<div className='grid-loader-container'>
								<GridLoader size={12} loading={true} color={'#A5368D'} />
							</div>
						}
					</div>
				</>
			}

			<div className='zendesk-chart-page-selector'>
				<i className={ page === 1 ? 'selected-zendesk-page fas fa-circle' : 'fas fa-circle' } onClick={() => setPage(1)}></i>
				<i className={ page === 2 ? 'selected-zendesk-page fas fa-circle' : 'fas fa-circle' } onClick={() => setPage(2)}></i>
			</div>
		</div>
	)
};
