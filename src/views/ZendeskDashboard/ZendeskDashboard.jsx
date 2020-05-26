import React, { useState } from 'react';
import './ZendeskDashboard.scss';
import TicketCountByAgent from './TicketCountByAgent/TicketCountByAgent';
import TicketCountByOrganization from './TicketCountByOrganization/TicketCountByOrganization';
import TicketCountByStatus from './TicketCountByStatus/TicketCountByStatus';
import TicketCountByAge from './TicketCountByAge/TicketCountByAge';
import AgentCountByOrganization from './AgentCountByOrganizationPanel/AgentCountByOrganizationPanel';

import { Link } from 'react-router-dom';
import GridLoader from 'react-spinners/GridLoader';

export default function ZendeskDashboard(props) {
	const [page, setPage] = useState(1);
	
	const { zendeskPanelData } = props;
	const {
		ticketCountByAgent,
		ticketCountByOrganization,
		ticketCountByStatus,
		ticketCountByAge,
		agentCountByOrganization,
	} = zendeskPanelData;

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
							ticketCountByAgent
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
							ticketCountByOrganization
							?
							<>
								<p className='panel-header'>Tickets by Organization</p>
								<div className='chart-container'>
									<TicketCountByOrganization ticketCountByOrganization={ticketCountByOrganization} />
								</div>
							</>
							:
							<div className='grid-loader-container'>
								<GridLoader size={12} loading={true} color={'#016C59'} />
							</div>
						}
					</div>

					<div className='dashboard-panel'>
						{
							ticketCountByStatus
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
							ticketCountByAge
							?
							<>
								<p className='panel-header'>Tickets by Age</p>
								<div className='chart-container'>
									<TicketCountByAge ticketCountByAge={ticketCountByAge} />
								</div>
							</>
							:
							<div className='grid-loader-container'>
								<GridLoader size={12} loading={true} color={'#800026'} />
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
							agentCountByOrganization
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

					<div className='dashboard-panel'>
						{
							agentCountByOrganization
							?
							<>
								<p className='panel-header'>Agents by Organization</p>
								<div className='chart-container'>
									<AgentCountByOrganization agentCountByOrganization={agentCountByOrganization} groupMode='stacked' />
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
