import React, { useState, useEffect } from 'react';
import './App.scss';
import { fetchData, stuckOrdersUtils, zendeskUtils } from './utils';
import StuckOrdersDashboard from './views/StuckOrdersDashboard/StuckOrdersDashboard';
import ZendeskDashboard from './views/ZendeskDashboard/ZendeskDashboard';

import queryString from 'query-string';
import '../node_modules/@fortawesome/fontawesome-free/css/all.css';
import GridLoader from 'react-spinners/GridLoader';


export default function App(props) {
   const [stuckOrdersData, setStuckOrdersData] = useState('');
   const [stuckOrdersPanelData, setStuckOrdersPanelData] = useState();
   const [zendeskData, setZendeskData] = useState('');
   const [zendeskPanelData, setZendeskPanelData] = useState();
   const [dashboardSelection, setDashboardSelection] = useState('stuck_orders');

   const dashboardOrder = ['stuck_orders', 'zendesk'];
   const isMonitorVersion = Boolean(Boolean(queryString.parse(props.location.search).toggle_interval));

   useEffect(() => {
      const stuckOrdersRequest = fetchData('/api/stuck_orders');
      const zendeskRequest = fetchData('/svc/tickets');

      Promise.all([stuckOrdersRequest, zendeskRequest])
         .then(results => {
            const [stuckOrdersResponse, zendeskResponse] = results;
            setStuckOrdersData(stuckOrdersResponse);
            setZendeskData(zendeskResponse);

             // if toggle interval parameter is provided (meaning it's the monitor version)
            if (props.location.search) {
               const queryValues = queryString.parse(props.location.search);
               let toggleTimer;

               if (queryValues.toggle_interval) {
                  const seconds = parseInt(queryValues.toggle_interval);
                  const toggleInterval = (seconds > 10 ? seconds * 1000 : 10000); // 10 second minimum
                  
                  toggleTimer = setInterval(() => {
                     const currentDashboard = dashboardOrder.shift();
                     dashboardOrder.push(currentDashboard);
                     const nextDashboard = dashboardOrder[0];

                     if (nextDashboard === 'stuck_orders') {
                        fetchData('/api/stuck_orders')
                           .then(data => {
                              setStuckOrdersData(data);
                              setDashboardSelection('stuck_orders');
                           })
                           .catch(err => console.log(err));
                     } else if (nextDashboard === 'zendesk') {
                        fetchData('/svc/tickets')
                           .then(data => {
                              setZendeskData(data);
                              setDashboardSelection('zendesk');
                           })
                           .catch(err => console.log(err));
                     }
                  }, toggleInterval);
               }
               
               return function() {
                  if (toggleTimer) {
                     clearInterval(toggleTimer);
                  }
               };
            }
         })
         .catch(err => {
            console.log(err);
         })
         // eslint-disable-next-line
   }, []);

   useEffect(() => {
      if (stuckOrdersData) {
         const clientsArr = stuckOrdersUtils.getClientCount(stuckOrdersData);
         const alertsArr = stuckOrdersUtils.getAlertCount(stuckOrdersData);
         const statusDaysArr = stuckOrdersUtils.getStatusDayCount(stuckOrdersData);
         const approvalDaysArr = stuckOrdersUtils.getApprovalDayCount(stuckOrdersData);
         const clientNames = {};
         stuckOrdersData.stuck_orders.forEach(order => {
            clientNames[order.client_db_name] = clientNames[order.client_db_name] || order.client;
         });
   
         setStuckOrdersPanelData({
            clientNames: clientNames,
            clientCount: clientsArr,
            alertCount: alertsArr,
            statusDayCount: statusDaysArr,
            approvalDayCount: approvalDaysArr,
         });
      }
   }, [stuckOrdersData]);

   useEffect(() => {
      if (zendeskData) {
         const ticketData = zendeskData.tickets;
         const ticketByAgentData = zendeskUtils.getTicketCountByAgent(ticketData);
         const ticketByOrgData = zendeskUtils.getTicketCountByOrg(ticketData);
         const ticketByStatusData = zendeskUtils.getTicketCountByStatus(ticketData);
         const ticketByAgeData = zendeskUtils.getTicketCountByAge(ticketData);
         const agentByOrgData = zendeskUtils.getAgentCountByOrg(ticketData);

         setZendeskPanelData({
            ticketCountByAgent: ticketByAgentData,
            ticketCountByOrganization: ticketByOrgData,
            ticketCountByStatus: ticketByStatusData,
            ticketCountByAge: ticketByAgeData,
            agentCountByOrganization: agentByOrgData,
         })
      }
   }, [zendeskData]);

   return (
      <div className='app'>
         {
            dashboardSelection === 'stuck_orders' &&
            stuckOrdersData &&
            stuckOrdersPanelData
            &&
            <StuckOrdersDashboard
               stuckOrdersData={stuckOrdersData}
               stuckOrdersPanelData={stuckOrdersPanelData}
               isMonitorVersion={isMonitorVersion}
            />
         }

         {
            dashboardSelection === 'zendesk' &&
            zendeskData &&
            zendeskPanelData
            &&
            <ZendeskDashboard
               zendeskPanelData={zendeskPanelData}
               isMonitorVersion={isMonitorVersion}
            />
         }

         {
            !stuckOrdersData &&
            !stuckOrdersPanelData &&
            !zendeskData &&
            !zendeskPanelData
            &&
            <div className='grid-loader-container'>
               <GridLoader size={12} loading={true} color={'#02818A'} />
            </div>
         }

         {
            !isMonitorVersion &&
            stuckOrdersData &&
            stuckOrdersPanelData &&
            zendeskData &&
            zendeskPanelData
            &&
            <div className='dashboard-tab-container'>
               <p
                  className={dashboardSelection === 'stuck_orders' ? 'selected-dashboard-tab' : 'dashboard-tab'}
                  onClick={() => setDashboardSelection('stuck_orders')}
               >Stuck Orders</p>
               <p>|</p>
               <p
                  className={dashboardSelection === 'zendesk' ? 'selected-dashboard-tab' : 'dashboard-tab'}
                  onClick={() => setDashboardSelection('zendesk')}
               >Zendesk</p>
            </div>
         }
      </div>
   )
}
