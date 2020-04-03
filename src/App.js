import React, { useState, useEffect } from 'react';
import './App.scss';
import ClientCountPanel from './components/panels/ClientCountPanel/ClientCountPanel';
import HighPriorityPanel from './components/panels/HighPriorityPanel/HighPriorityPanel';
import StatusDayCountPanel from './components/panels/StatusDayCountPanel/StatusDayCountPanel';
import ApprovalDayCountPanel from './components/panels/ApprovalDayCountPanel/ApprovalDayCountPanel';

import axios from 'axios';
import GridLoader from 'react-spinners/GridLoader';
import moment from 'moment';
import { Link } from 'react-router-dom';
import '../node_modules/@fortawesome/fontawesome-free/css/all.css';

export const getOrderData = async () => {
   try {
      return axios.get('/api/stuck_orders').then(res => res.data);
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
         let now = moment(new Date());
         let orderDate = moment(new Date(order.order_timestamp));
         const difference = now.diff(orderDate, 'days');

         if (difference > 2) { // older than 2 days
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
   for (let i = 0; i <= 8; i++) {
      if (i === 8) {
         days['8+'] = {day: '8+', 'Day': 0};
      } else {
         days[i.toString()] = {day: i.toString(), 'Day': 0};
      }
   }

   if (orderData) {
      orderData.stuck_orders.forEach(order => {
         let now = moment(new Date());
         let statusChange = moment(new Date(order.status_change_timestamp));
         const difference = now.diff(statusChange, 'days');

         if (difference >= 8) {
            days['8+']['Day']++;
         } else {
            days[difference.toString()]['Day']++;
         }
      })
   }

   let statusDaysArr = [];
   for (let day in days) {
      statusDaysArr.push(days[day]);
   }

   return statusDaysArr;
};

const getApprovalDayCount = (orderData) => {
   let days = {};
   for (let i = 0; i <= 8; i++) {
      if (i === 8) {
         days['8+'] = {day: '8+', 'Day': 0};
      } else {
         days[i.toString()] = {day: i.toString(), 'Day': 0};
      }
   }

   if (orderData) {
      orderData.stuck_orders.forEach(order => {
         let now = moment(new Date());
         let approvalChange = moment(new Date(order.approval_timestamp));
         const difference = now.diff(approvalChange, 'days');

         if (difference >= 8) {
            days['8+']['Day']++;
         } else {
            days[difference.toString()]['Day']++;
         }
      })
   }
   
   const approvalDaysArr = [];
   for (let day in days) {
      approvalDaysArr.push(days[day]);
   }

   return approvalDaysArr;
};

const getBusinessHours = (timestamp) => {
   const weekendDays = ['Saturday', 'Sunday'];
   let businessHours = 0;
   const now = moment(new Date());
   const givenDate = moment(new Date(timestamp));
   let daysDifference = now.diff(givenDate, 'days');
   let startHours = (24 - givenDate.hours());
   let todaysHours = now.diff(givenDate, 'hours');
   
   if (!weekendDays.includes(now.format('dddd'))) {
      if (daysDifference !== 0) {
         businessHours+= startHours;
      }
      businessHours+= todaysHours;
   }
   daysDifference--;

   while (daysDifference > 0) {
      const dayName = givenDate.format('dddd');
      if (!weekendDays.includes(dayName)) {
         businessHours += 24;
      }
      daysDifference--;
   }

   return businessHours;
};

function App() {
   const [orderData, setOrderData] = useState('');
   const [clientCount, setClientCount] = useState([])
   const [highPriorities, setHighPriorities] = useState([]);
   const [statusDayCount, setDayCount] = useState([]);
   const [approvalDayCount, setApprovalDayCount] = useState([]);


   useEffect(() => {
      getOrderData().then(data => {
         setOrderData(data);
         // console.log(data)
      })
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
         <GridLoader size={12} loading={true} color={'#A5368D'} />
         </div>
         }
         
         {
         orderData
         ?
         <HighPriorityPanel highPriorities={highPriorities} />
         :
         <div style={{ width: '50%', height: '50%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
         <GridLoader size={12} loading={true} color={'#3690C0'} />
         </div>
         }
         
         {
         orderData
         ?
         <StatusDayCountPanel statusDayCount={statusDayCount} />
         :
         <div style={{ width: '50%', height: '50%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
         <GridLoader size={12} loading={true} color={'#800026'} />
         </div>
         }
         
         {
         orderData
         ?
         <ApprovalDayCountPanel approvalDayCount={approvalDayCount} />
         :
         <div style={{ width: '50%', height: '50%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
         <GridLoader size={12} loading={true} color={'#016C59'} />
         </div>
         }
         <Link to='/details'>
            <div className='details-link'>
               <i className="fas fa-info-circle"></i>
               <p>Details</p>
            </div>
         </Link>
      </div>
   );
}

export default App;