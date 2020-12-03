import React, { useState, useEffect } from 'react';
import './App.scss';
import { fetchData } from './utils/utils';
import StuckOrdersDashboard from './views/StuckOrdersDashboard/StuckOrdersDashboard';
import ZendeskDashboard from './views/ZendeskDashboard/ZendeskDashboard';
import useStuckOrdersData from './hooks/useStuckOrdersData';
import useZendeskData from './hooks/useZendeskData';

import queryString from 'query-string';
import '../node_modules/@fortawesome/fontawesome-free/css/all.css';
import GridLoader from 'react-spinners/GridLoader';

export default function App(props) {
  const { stuckOrdersData, setStuckOrdersData, stuckOrdersPanelData } = useStuckOrdersData('');
  const { zendeskData, setZendeskData, zendeskPanelData } = useZendeskData('');
  const [dashboardSelection, setDashboardSelection] = useState('stuck_orders');

  const dashboardOrder = ['stuck_orders', 'zendesk'];
  const isMonitorVersion = Boolean(queryString.parse(props.location.search).toggle_interval);

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
            const toggleInterval = seconds > 10 ? seconds * 1000 : 10000; // 10 second minimum

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

          return function () {
            if (toggleTimer) {
              clearInterval(toggleTimer);
            }
          };
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, []); // eslint-disable-line

  return (
    <div className='app'>
      {dashboardSelection === 'stuck_orders' && stuckOrdersData && stuckOrdersPanelData && (
        <StuckOrdersDashboard
          stuckOrdersData={stuckOrdersData}
          stuckOrdersPanelData={stuckOrdersPanelData}
          isMonitorVersion={isMonitorVersion}
        />
      )}

      {dashboardSelection === 'zendesk' && zendeskData && zendeskPanelData && (
        <ZendeskDashboard zendeskPanelData={zendeskPanelData} isMonitorVersion={isMonitorVersion} />
      )}

      {!stuckOrdersData && !stuckOrdersPanelData && !zendeskData && !zendeskPanelData && (
        <div className='grid-loader-container'>
          <GridLoader size={12} loading={true} color={'#02818A'} />
        </div>
      )}

      {!isMonitorVersion && stuckOrdersData && stuckOrdersPanelData && zendeskData && zendeskPanelData && (
        <div className='dashboard-tab-container'>
          <p
            className={dashboardSelection === 'stuck_orders' ? 'selected-dashboard-tab' : 'dashboard-tab'}
            onClick={() => setDashboardSelection('stuck_orders')}
          >
            Stuck Orders
          </p>
          <p>|</p>
          <p
            className={dashboardSelection === 'zendesk' ? 'selected-dashboard-tab' : 'dashboard-tab'}
            onClick={() => setDashboardSelection('zendesk')}
          >
            Zendesk
          </p>
        </div>
      )}
    </div>
  );
}
