import React, { useState, useEffect } from 'react';
import './App.scss';
import ClientCountPanel from './components/panels/ClientCountPanel/ClientCountPanel';
import HighPriorityPanel from './components/panels/HighPriorityPanel/HighPriorityPanel';
import StatusDayCountPanel from './components/panels/StatusDayCountPanel/StatusDayCountPanel';
import ApprovalDayCountPanel from './components/panels/ApprovalDayCountPanel/ApprovalDayCountPanel';

import axios from 'axios';

function App() {
   const [orderData, setOrderData] = useState();
   const [expeditedCount, setExpeditedCount] = useState([]);
   const [highPriorities, setHighPriorities] = useState([]);
   const [statusDayCount, setDayCount] = useState([]);
   const [approvalDayCount, setApprovalDayCount] = useState([]);

   const getOrderData = async () => {
      try {
         let res = await axios.get('https://stuckorders.mobilsense.com/api/stuck_orders');
         setOrderData(res.data);
         console.log(res.data.stuck_orders)
      } catch (err) {
         console.log(err);
      }
   };

   const getExpeditedCount = (orderData) => {
      let clients = {};
      if (orderData) {
         orderData.stuck_orders.forEach(order => {
            clients[order.client] = clients[order.client] || {client: order.client_db_name, "Expedited": 0, "Non-Expedited": 0};
            if (order.expedited) {
               clients[order.client]['Expedited']++;
            } else {
               clients[order.client]['Non-Expedited']++;
            }
         })
      }
      const clientsArr = [];
      for (let client in clients) {
         clientsArr.push(clients[client]);
      }
      return clientsArr;
   };

   const getHighPriorities = (orderData) => {
      let priorities = [];
      if (orderData) {
         priorities = orderData.stuck_orders.filter(order => {
            let today = new Date();
            let orderDate = new Date(order.order_timestamp);
            if (today.getDate() - orderDate.getDate() > 2) { // older than 2 days
               return true;
            } else {
               return false;
            }
         });
      }
      return priorities;
   };

   const getStatusDayCount = (orderData) => {
      let days = {};
      if (orderData) {
         orderData.stuck_orders.forEach(order => {
            let today = new Date();
            let statusChangeDate = new Date(order.status_change_timestamp);
            let difference = (today.getDate() - statusChangeDate.getDate()).toString();
            days[difference] = days[difference] || {day: difference, count: 0};
            days[difference].count++;
         })
      }
      const statusDaysArr = [];
      for (let day in days) {
         statusDaysArr.push(days[day]);
      }
      return statusDaysArr;
   };

   const getApprovalDayCount = (orderData) => {
      let days = {};
      if (orderData) {
         orderData.stuck_orders.forEach(order => {
            let today = new Date();
            let approvalDate = new Date(order.approval_timestamp);
            let difference = (today.getDate() - approvalDate.getDate()).toString();
            days[difference] = days[difference] || {day: difference, count: 0};
            days[difference].count++;
         })
      }
      const approvalDaysArr = [];
      for (let day in days) {
         approvalDaysArr.push(days[day]);
      }
      return approvalDaysArr;
   };

   useEffect(() => {
      getOrderData();
   }, []);

   useEffect(() => {
      const clientsArr = getExpeditedCount(orderData);
      const prioritiesArr = getHighPriorities(orderData);
      const statusDaysArr = getStatusDayCount(orderData);
      const approvalDaysArr = getApprovalDayCount(orderData);

      setExpeditedCount(clientsArr);
      setHighPriorities(prioritiesArr);
      setDayCount(statusDaysArr);
      setApprovalDayCount(approvalDaysArr);
   }, [orderData]);

   return (
      <div className='app'>
         <ClientCountPanel expeditedCount={expeditedCount} />
         <HighPriorityPanel highPriorities={highPriorities} />
         <StatusDayCountPanel statusDayCount={statusDayCount} />
         <ApprovalDayCountPanel approvalDayCount={approvalDayCount} />
      </div>
   );
}

export default App;