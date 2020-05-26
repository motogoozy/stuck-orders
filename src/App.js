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
               let queryValues = queryString.parse(props.location.search);
               let toggleTimer;
               let fetchTimer;

               if (queryValues.toggle_interval) {
                  let toggleInterval = parseInt(queryValues.toggle_interval) * 1000; // seconds
                  if (toggleInterval < 10000) {
                     toggleInterval = 10000; // 10 second minimum
                  }
                  const fetchInterval = toggleInterval - 5000;

                  fetchTimer = setInterval(() => {
                     if (dashboardSelection !== 'stuck_orders') {
                        fetchData('/api/stuck_orders')
                           .then(data => {
                              setStuckOrdersData(data);
                           })
                           .catch(err => console.log(err));
                     }
                     if (dashboardSelection !== 'zendesk') {
                        fetchData('/svc/tickets')
                           .then(data => {
                              setZendeskData(data);
                           })
                           .catch(err => console.log(err));
                     }
                  }, fetchInterval);
                  
                  toggleTimer = setInterval(() => {
                     // TODO
                  }, toggleInterval);
               }
               
               return function() {
                  if (fetchTimer) {
                     clearInterval(fetchTimer);
                  }
                  if (toggleTimer) {
                     clearInterval(toggleTimer);
                  }
               };
            }
         })
         .catch(err => {
            console.log(err);
         })
   }, [props.location.search, props.history]);

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
            zendeskData &&
            zendeskPanelData
            &&
            <StuckOrdersDashboard
               stuckOrdersData={stuckOrdersData}
               stuckOrdersPanelData={stuckOrdersPanelData}
            />
         }

         {
            dashboardSelection === 'zendesk' &&
            zendeskData &&
            zendeskPanelData
            &&
            <ZendeskDashboard zendeskPanelData={zendeskPanelData} />
         }

         {
            !zendeskData &&
            !zendeskPanelData &&
            !zendeskData &&
            !zendeskPanelData
            &&
            <div className='grid-loader-container'>
               <GridLoader size={12} loading={true} color={'#02818A'} />
            </div>
         }

         {
            // don't display Details Link if fetch_interval param is provided
            !queryString.parse(props.location.search).fetch_interval
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
