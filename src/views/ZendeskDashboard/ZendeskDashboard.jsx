import React, { useState } from 'react';
import './ZendeskDashboard.scss';
import TicketCountByAgent from './TicketCountByAgent/TicketCountByAgent';
import TicketCountByOrganization from './TicketCountByOrganization/TicketCountByOrganization';
import TicketCountByStatus from './TicketCountByStatus/TicketCountByStatus';
import TicketCountByAge from './TicketCountByAge/TicketCountByAge';
import AgentCountByOrganizationPanel from './AgentCountByOrganizationPanel/AgentCountByOrganizationPanel';
import { randomizePanels } from '../../utils';

export default function ZendeskDashboard(props) {
  const [page, setPage] = useState(1);

  const { zendeskPanelData, isMonitorVersion } = props;
  const {
    ticketCountByAgent,
    ticketCountByOrganization,
    ticketCountByStatus,
    ticketCountByAge,
    agentCountByOrganization,
  } = zendeskPanelData;

  let panelsToDisplay = randomizePanels([
    'ticketCountByAgent',
    'ticketCountByOrganization',
    'ticketCountByStatus',
    'ticketCountByAge',
    'agentCountByOrganization',
  ]);

  return (
    <div className='dashboard'>
      {!isMonitorVersion ? (
        <>
          {page === 1 && (
            <>
              <div className='dashboard-panel'>
                <p className='panel-header'>Tickets by Agent</p>
                <div className='chart-container'>
                  <TicketCountByAgent ticketCountByAgent={ticketCountByAgent} />
                </div>
              </div>

              <div className='dashboard-panel'>
                <p className='panel-header'>Tickets by Organization</p>
                <div className='chart-container'>
                  <TicketCountByOrganization ticketCountByOrganization={ticketCountByOrganization} />
                </div>
              </div>

              <div className='dashboard-panel'>
                <p className='panel-header'>Tickets by Status</p>
                <div className='chart-container'>
                  <TicketCountByStatus ticketCountByStatus={ticketCountByStatus} />
                </div>
              </div>

              <div className='dashboard-panel'>
                <p className='panel-header'>Tickets by Age</p>
                <div className='chart-container'>
                  <TicketCountByAge ticketCountByAge={ticketCountByAge} />
                </div>
              </div>
            </>
          )}

          {page === 2 && (
            <>
              <div className='dashboard-panel'>
                <p className='panel-header'>Agents by Organization</p>
                <div className='chart-container'>
                  <AgentCountByOrganizationPanel agentCountByOrganization={agentCountByOrganization} />
                </div>
              </div>
            </>
          )}

          <div className='zendesk-chart-page-selector'>
            <i
              className={page === 1 ? 'selected-zendesk-page fas fa-circle' : 'fas fa-circle'}
              onClick={() => setPage(1)}
            ></i>
            <i
              className={page === 2 ? 'selected-zendesk-page fas fa-circle' : 'fas fa-circle'}
              onClick={() => setPage(2)}
            ></i>
          </div>
        </>
      ) : (
        // For Monitor Version
        <>
          {panelsToDisplay.includes('ticketCountByAgent') && (
            <div className='dashboard-panel'>
              <p className='panel-header'>Tickets by Agent</p>
              <div className='chart-container'>
                <TicketCountByAgent ticketCountByAgent={ticketCountByAgent} />
              </div>
            </div>
          )}

          {panelsToDisplay.includes('ticketCountByOrganization') && (
            <div className='dashboard-panel'>
              <p className='panel-header'>Tickets by Organization</p>
              <div className='chart-container'>
                <TicketCountByOrganization ticketCountByOrganization={ticketCountByOrganization} />
              </div>
            </div>
          )}

          {panelsToDisplay.includes('ticketCountByStatus') && (
            <div className='dashboard-panel'>
              <p className='panel-header'>Tickets by Status</p>
              <div className='chart-container'>
                <TicketCountByStatus ticketCountByStatus={ticketCountByStatus} />
              </div>
            </div>
          )}

          {panelsToDisplay.includes('ticketCountByAge') && (
            <div className='dashboard-panel'>
              <p className='panel-header'>Tickets by Age</p>
              <div className='chart-container'>
                <TicketCountByAge ticketCountByAge={ticketCountByAge} />
              </div>
            </div>
          )}

          {panelsToDisplay.includes('agentCountByOrganization') && (
            <div className='dashboard-panel'>
              <p className='panel-header'>Agents by Organization</p>
              <div className='chart-container'>
                <AgentCountByOrganizationPanel
                  agentCountByOrganization={agentCountByOrganization}
                  groupMode='stacked'
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
