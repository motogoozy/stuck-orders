import React from 'react';
import './HighPriorityPanel.scss';
import { formatDate } from '../../../utils.js';

export default function HighPriorityPanel(props) {
   const displayAlertRows = () => {
      let rows = props.highPriorities.map(order => {
         let date = formatDate(new Date(order.order_timestamp));
         return (
            <div key={order.order_number} className='high-priority-row'>
               <p>{order.order_number}</p>
               <p>{date}</p>
               <p>{order.client}</p>
               <p>{order.order_status}</p>
               <p>{order.order_type}</p>
            </div>
         )
      });
      return rows;
   };

   return (
      <div className='dashboard-panel high-priority-panel'>
         <p className='panel-header'>High Priority</p>
         <div className='alert-table'>
            <div className='alert-table-header'>
               <p>Order Number</p>
               <p>Time</p>
               <p>Client</p>
               <p>Status</p>
               <p>Type</p>
            </div>
            <div className='alert-table-body'>
               { displayAlertRows() }
            </div>
         </div>
      </div>
   )
};