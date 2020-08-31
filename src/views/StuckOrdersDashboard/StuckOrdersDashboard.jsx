import React from 'react';
import './StuckOrdersDashboard.scss';
import StuckOrdersByClientPanel from './StuckOrdersByClientPanel/StuckOrdersByClientPanel';
import AlertPanel from './AlertPanel/AlertPanel';
import ApprovedOrdersByClientPanel from './ApprovedOrdersByClientPanel/ApprovedOrdersByClientPanel';
import StatusAgeCountPanel from './StatusAgeCountPanel/StatusAgeCountPanel';

import '../../../node_modules/@fortawesome/fontawesome-free/css/all.css';
import { Link } from 'react-router-dom';

export default function StuckOrdersDashboard(props) {
  const { stuckOrdersData, stuckOrdersPanelData, isMonitorVersion } = props;
  let approvedOrdersCount = 0;
  stuckOrdersData.stuck_orders.forEach(order => {
    if (order.order_status === 'Approved') {
      approvedOrdersCount++;
    }
  });

  return (
    <div className='dashboard'>
      <div className='dashboard-panel client-count-panel'>
        <p className='panel-header'>Stuck Orders by Client ({stuckOrdersData.stuck_orders.length})</p>
        <div className='chart-container'>
          <StuckOrdersByClientPanel
            clientNames={stuckOrdersPanelData.clientNames}
            stuckOrdersByClient={stuckOrdersPanelData.stuckOrdersByClient}
          />
        </div>
      </div>

      <div className='dashboard-panel alert-panel'>
        <p className='panel-header'>Alerts</p>
        <div className='chart-container'>
          {stuckOrdersData && stuckOrdersPanelData.alertCount.length === 0 ? (
            <div className='no-alerts-container'>
              <i className='far fa-check-square'></i>
              <p>All Caught Up!</p>
            </div>
          ) : (
            <AlertPanel alertCount={stuckOrdersPanelData.alertCount} />
          )}
        </div>
      </div>

      <div className='dashboard-panel client-count-panel'>
        <p className='panel-header'>Approved Orders by Client ({approvedOrdersCount})</p>
        <div className='chart-container'>
          <ApprovedOrdersByClientPanel
            clientNames={stuckOrdersPanelData.clientNames}
            approvedOrdersByClient={stuckOrdersPanelData.approvedOrdersByClient}
          />
        </div>
      </div>

      <div className='dashboard-panel status-day-count-panel'>
        <p className='panel-header'>Current Status Age</p>
        <div className='chart-container'>
          <StatusAgeCountPanel statusAgeCount={stuckOrdersPanelData.statusAgeCount} />
        </div>
      </div>

      {!isMonitorVersion && (
        <Link to='/details'>
          <div className='details-link dashboard-link'>
            <i className='fas fa-info-circle'></i>
            <p>Details</p>
          </div>
        </Link>
      )}
    </div>
  );
}
