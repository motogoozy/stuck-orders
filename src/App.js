import React, { useState, useEffect } from 'react';
import './App.scss';
import ClientCountPanel from './components/panels/ClientCountPanel/ClientCountPanel';
import AlertPanel from './components/panels/AlertPanel/AlertPanel';
import StatusDayCountPanel from './components/panels/StatusDayCountPanel/StatusDayCountPanel';
import ApprovalDayCountPanel from './components/panels/ApprovalDayCountPanel/ApprovalDayCountPanel';

import axios from 'axios';
import GridLoader from 'react-spinners/GridLoader';
import { Link } from 'react-router-dom';
import '../node_modules/@fortawesome/fontawesome-free/css/all.css';

export const getOrderData = async () => {
   try {
      let res = await axios.get('/api/stuck_orders');
      return res.data;
   } catch (err) {
      console.log(err);
   }
};

const getClientCount = (orderData) => {
   let clients = {};
   orderData.stuck_orders.forEach(order => {
      clients[order.client] = clients[order.client] || {client: order.client_db_name, 'Expedited': 0, 'Standard': 0, 'Total': 0};
      if (order.expedited) {
         clients[order.client]['Expedited']++;
         clients[order.client]['Total']++;
         clients[order.client].client = `${order.client_db_name} (${clients[order.client]['Total']})`
      } else {
         clients[order.client]['Standard']++;
         clients[order.client]['Total']++;
         clients[order.client].client = `${order.client_db_name} (${clients[order.client]['Total']})`
      }
   })

   const clientsArr = [];
   for (let client in clients) {
      clientsArr.push(clients[client]);
   }

   return clientsArr;
};

const getAlertCount = (orderData) => {
   let alerts = {
      expedited_approval_alert: {alertName: 'Exp. Approved 4+', dbName: 'expedited_approval_alert', 'Count': 0},
      standard_approval_alert: {alertName: 'Std. Approved 24+', dbName: 'standard_approval_alert', 'Count': 0},
      aged_order_gte_72_lt_96_alert: {alertName: 'Pending Orders 72+', dbName: 'aged_order_gte_72_lt_96_alert', 'Count': 0},
      aged_order_gte_96_alert: {alertName: 'Pending Orders 96+', dbName: 'aged_order_gte_96_alert', 'Count': 0},
   };
   orderData.stuck_orders.forEach(order => {
      if (order.expedited_approval_alert) {
         alerts.expedited_approval_alert['Count']++;
      }
      if (order.standard_approval_alert) {
         alerts.standard_approval_alert['Count']++;
      }
      if (order.aged_order_gte_72_lt_96_alert) {
         alerts.aged_order_gte_72_lt_96_alert['Count']++;
      }
      if (order.aged_order_gte_96_alert) {
         alerts.aged_order_gte_96_alert['Count']++;
      }
   });

   let alertsArr = [];
   for (let alert in alerts) {
      alertsArr.push(alerts[alert]);
   }

   return alertsArr;
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

   orderData.stuck_orders.forEach(order => {
      const statusAgeInDays = Math.floor(order.status_change_business_age / 24);

      if (statusAgeInDays >= 8) {
         days['8+']['Day']++;
      } else {
         days[statusAgeInDays.toString()]['Day']++;
      }
   })

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

   orderData.stuck_orders.forEach(order => {
      const approvalAgeInDays = Math.floor(order.approval_business_age / 24);

      if (approvalAgeInDays >= 8) {
         days['8+']['Day']++;
      } else {
         days[approvalAgeInDays.toString()]['Day']++;
      }
   })
   
   const approvalDaysArr = [];
   for (let day in days) {
      approvalDaysArr.push(days[day]);
   }

   return approvalDaysArr;
};

function App() {
   const [orderData, setOrderData] = useState('');
   const [clientNames, setClientNames] = useState({});
   const [clientCount, setClientCount] = useState([])
   const [alertCount, setAlertCount] = useState([]);
   const [statusDayCount, setDayCount] = useState([]);
   const [approvalDayCount, setApprovalDayCount] = useState([]);

   useEffect(() => {
      getOrderData().then(data => {
         setOrderData(data);
      });
   }, []);

   useEffect(() => {
      if (orderData) {
         const clientsArr = getClientCount(orderData);
         const alertsArr = getAlertCount(orderData);
         const statusDaysArr = getStatusDayCount(orderData);
         const approvalDaysArr = getApprovalDayCount(orderData);
         const clientNames = {};
         orderData.stuck_orders.forEach(order => {
            clientNames[order.client_db_name] = clientNames[order.client_db_name] || order.client;
         });
   
         setClientNames(clientNames);
         setClientCount(clientsArr);
         setAlertCount(alertsArr);
         setDayCount(statusDaysArr);
         setApprovalDayCount(approvalDaysArr);
      }
   }, [orderData]);

   return (
      <div className='app'>
         {
         orderData
         ?
         <ClientCountPanel clientNames={clientNames} clientCount={clientCount} />
         :
         <div style={{ width: '50%', height: '50%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <GridLoader size={12} loading={true} color={'#A5368D'} />
         </div>
         }
         
         {
         orderData
         ?
         <AlertPanel alertCount={alertCount} />
         :
         <div style={{ width: '50%', height: '50%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <GridLoader size={12} loading={true} color={'#800026'} />
         </div>
         }
         
         {
         orderData
         ?
         <StatusDayCountPanel statusDayCount={statusDayCount} />
         :
         <div style={{ width: '50%', height: '50%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <GridLoader size={12} loading={true} color={'#3690C0'} />
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