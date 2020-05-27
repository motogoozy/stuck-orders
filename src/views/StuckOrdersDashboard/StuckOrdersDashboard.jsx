import React from 'react';
import './StuckOrdersDashboard.scss';
import ClientCountPanel from './ClientCountPanel/ClientCountPanel';
import AlertPanel from './AlertPanel/AlertPanel';
import StatusDayCountPanel from './StatusDayCountPanel/StatusDayCountPanel';
import ApprovalDayCountPanel from './ApprovalDayCountPanel/ApprovalDayCountPanel';

import '../../../node_modules/@fortawesome/fontawesome-free/css/all.css';
import { Link } from 'react-router-dom';

export default function StuckOrdersDashboard(props) {
   const { stuckOrdersData, stuckOrdersPanelData, isMonitorVersion } = props;

   return (
      <div className='dashboard'>
         <div className='dashboard-panel client-count-panel'>
            <p className='panel-header'>Stuck Orders by Client ({stuckOrdersData.stuck_orders.length})</p>
            <div className='chart-container'>
               <ClientCountPanel clientNames={stuckOrdersPanelData.clientNames} clientCount={stuckOrdersPanelData.clientCount}/>
            </div>
         </div>
         
         <div className='dashboard-panel alert-panel'>
            <p className='panel-header'>Alerts</p>
            <div className='chart-container'>
               {
                  stuckOrdersData && stuckOrdersPanelData.alertCount.length === 0
                  ?
                  <div className='no-alerts-container'>
                     <i className="far fa-check-square"></i>
                     <p>All Caught Up!</p>
                  </div>
                  :
                  <AlertPanel alertCount={stuckOrdersPanelData.alertCount} />
               }
            </div>
         </div>

         <div className='dashboard-panel status-day-count-panel'>
            <p className='panel-header'>Current Status Age</p>
            <div className='chart-container'>
               <StatusDayCountPanel statusDayCount={stuckOrdersPanelData.statusDayCount} />
            </div>     
         </div>

         <div className='dashboard-panel approval-day-count-panel'>
            <p className='panel-header'>Approval Age</p>
            <div className='chart-container'>
               <ApprovalDayCountPanel approvalDayCount={stuckOrdersPanelData.approvalDayCount} />
            </div>
         </div>

         {
            !isMonitorVersion
            &&
            <Link to='/details'>
               <div className='details-link dashboard-link'>
                  <i className="fas fa-info-circle"></i>
                  <p>Details</p>
               </div>
            </Link>
         }
      </div>
   )
}
