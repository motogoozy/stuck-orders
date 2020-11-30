import { useState, useEffect } from 'react';
import {
  getTicketCountByAgent,
  getTicketCountByOrg,
  getTicketCountByStatus,
  getTicketCountByAge,
  getAgentCountByOrg,
} from '../utils/zendeskUtils';

export default function useZendeskData(initialValue) {
  const [zendeskData, setZendeskData] = useState(initialValue);
  const [zendeskPanelData, setZendeskPanelData] = useState();

  useEffect(() => {
    if (zendeskData) {
      const ticketData = zendeskData.tickets;
      const ticketByAgentData = getTicketCountByAgent(ticketData);
      const ticketByOrgData = getTicketCountByOrg(ticketData);
      const ticketByStatusData = getTicketCountByStatus(ticketData);
      const ticketByAgeData = getTicketCountByAge(ticketData);
      const agentByOrgData = getAgentCountByOrg(ticketData);

      setZendeskPanelData({
        ticketCountByAgent: ticketByAgentData,
        ticketCountByOrganization: ticketByOrgData,
        ticketCountByStatus: ticketByStatusData,
        ticketCountByAge: ticketByAgeData,
        agentCountByOrganization: agentByOrgData,
      });
    }
  }, [zendeskData]);

  return {
    zendeskData,
    setZendeskData,
    zendeskPanelData,
    setZendeskPanelData,
  };
}
