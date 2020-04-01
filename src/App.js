import React, { useState, useEffect } from 'react';
import './App.scss';
import ClientCountPanel from './components/panels/ClientCountPanel/ClientCountPanel';
import HighPriorityPanel from './components/panels/HighPriorityPanel/HighPriorityPanel';
import StatusDayCountPanel from './components/panels/StatusDayCountPanel/StatusDayCountPanel';
import ApprovalDayCountPanel from './components/panels/ApprovalDayCountPanel/ApprovalDayCountPanel';

import axios from 'axios';
import GridLoader from 'react-spinners/GridLoader';

function App() {
   const [orderData, setOrderData] = useState('');
   const [clientCount, setClientCount] = useState([])
   const [highPriorities, setHighPriorities] = useState([]);
   const [statusDayCount, setDayCount] = useState([]);
   const [approvalDayCount, setApprovalDayCount] = useState([]);

   const getOrderData = async () => {
      try {
         let res = await axios.get('/api/stuck_orders');
         setOrderData(res.data);
         console.log(res.data.stuck_orders)
      } catch (err) {
         console.log(err);
      }
   };

   const getClientCount = (orderData) => {
      let clients = {};
      if (orderData) {
         orderData.stuck_orders.forEach(order => {
            clients[order.client] = clients[order.client] || {client: order.client_db_name, 'Expedited': 0, 'Non-Expedited': 0, 'Total': 0};
            if (order.expedited) {
               clients[order.client]['Expedited']++;
               clients[order.client]['Total']++;
               clients[order.client].client = `${order.client_db_name} (${clients[order.client]['Total']})`
            } else {
               clients[order.client]['Non-Expedited']++;
               clients[order.client]['Total']++;
               clients[order.client].client = `${order.client_db_name} (${clients[order.client]['Total']})`
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
            days[difference] = days[difference] || {day: difference, 'Day': 0};
            days[difference]['Day']++;
         })
      }
      const statusDaysArr = [];
      for (let day in days) {
         if (statusDaysArr.length === 9) {
            break;
         } else {
            statusDaysArr.push(days[day]);
         }
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
            days[difference] = days[difference] || {day: difference, 'Day': 0};
            days[difference]['Day']++;
         })
      }
      const approvalDaysArr = [];
      for (let day in days) {
         if (approvalDaysArr.length === 9) {
            break;
         } else {
            approvalDaysArr.push(days[day]);
         }
      }
      return approvalDaysArr;
   };

   useEffect(() => {
      getOrderData();
   }, []);

   useEffect(() => {
      const clientsArr = getClientCount(orderData);
      const prioritiesArr = getHighPriorities(orderData);
      const statusDaysArr = getStatusDayCount(orderData);
      const approvalDaysArr = getApprovalDayCount(orderData);

      setClientCount(clientsArr);
      setHighPriorities(prioritiesArr);
      setDayCount(statusDaysArr);
      setApprovalDayCount(approvalDaysArr);
   }, [orderData]);

   return (
      <div className='app'>
         {
         orderData 
         ? 
         <ClientCountPanel clientCount={clientCount} />
         :
         <div style={{ width: '50%', height: '50%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <GridLoader size={15} loading={true} color={'#A5368D'} />
         </div>
         }

         {
         orderData 
         ? 
         <HighPriorityPanel highPriorities={highPriorities} />
         :
         <div style={{ width: '50%', height: '50%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <GridLoader size={15} loading={true} color={'#3690C0'} />
         </div>
         }

         {
         orderData 
         ? 
         <StatusDayCountPanel statusDayCount={statusDayCount} />
         :
         <div style={{ width: '50%', height: '50%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <GridLoader size={15} loading={true} color={'#800026'} />
         </div>
         }
         
         {
         orderData 
         ? 
         <ApprovalDayCountPanel approvalDayCount={approvalDayCount} />
         :
         <div style={{ width: '50%', height: '50%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <GridLoader size={15} loading={true} color={'#016C59'} />
         </div>
         }
      </div>
   );
}

export default App;