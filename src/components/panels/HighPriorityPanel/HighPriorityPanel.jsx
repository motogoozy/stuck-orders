import React from 'react';
import './HighPriorityPanel.scss';

export const formatDate = (dateObj) => {
   const year = dateObj.getFullYear().toString().split('').slice(2).join('');
   let month = dateObj.getMonth() + 1;
   let day = dateObj.getDate();
   let hour = dateObj.getHours();
   let minutes = dateObj.getMinutes();
   const daytime = hour < 12 ? 'am' : 'pm';

   // if (month < 10) {
   //    month = `0${month}`;
   // }

   if (day < 10) {
      day = `0${day}`;
   }

   if (hour > 12) {
      hour = hour - 12;
   }
   
   if (hour === 0) {
      hour = 12;
   }

   if (minutes < 10) {
      minutes = `0${minutes}`;
   }

   return `${month}/${day}/${year} at ${hour}:${minutes}${daytime}`;
};

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