import React, { useState, useEffect } from 'react';
import './App.scss';
import ClientCountPanel from './components/panels/ClientCountPanel/ClientCountPanel';
import AlertPanel from './components/panels/AlertPanel/AlertPanel';
import StatusDayCountPanel from './components/panels/StatusDayCountPanel/StatusDayCountPanel';
import ApprovalDayCountPanel from './components/panels/ApprovalDayCountPanel/ApprovalDayCountPanel';
import { fetchData } from './utils';

import GridLoader from 'react-spinners/GridLoader';
import { Link } from 'react-router-dom';
import '../node_modules/@fortawesome/fontawesome-free/css/all.css';
import queryString from 'query-string';

export const getClientCount = (orderData) => {
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

export const getAlertCount = (orderData) => {
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
   for (let type in alerts) {
      alertsArr.push(alerts[type]);
   }

   if (
      alerts.expedited_approval_alert.Count === 0 &&
      alerts.standard_approval_alert.Count === 0 &&
      alerts.aged_order_gte_72_lt_96_alert.Count === 0 &&
      alerts.aged_order_gte_96_alert.Count === 0
   ) return [];

   return alertsArr;
};

export const getStatusDayCount = (orderData) => {
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

export const getApprovalDayCount = (orderData) => {
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

export default function App(props) {
   const [orderData, setOrderData] = useState('');
   const [clientNames, setClientNames] = useState();
   const [clientCount, setClientCount] = useState()
   const [alertCount, setAlertCount] = useState();
   const [statusDayCount, setDayCount] = useState();
   const [approvalDayCount, setApprovalDayCount] = useState();

   useEffect(() => {
      fetchData('/api/stuck_orders')
         .then(data => {
            setOrderData(data);

            // if fetch interval parameter is provided (meaning it's the monitor version)
            if (props.location.search) {
               let queryValues = queryString.parse(props.location.search);
               if (queryValues.fetch_interval) {
                  const interval = parseInt(queryValues.fetch_interval * 1000); // seconds
                  let orderTimer = setInterval(() => {
                     fetchData('/api/stuck_orders')
                        .then(data => {
                           setOrderData(data);
                        })
                        .catch(err => console.log(err));
                  }, interval);
            
                  return () => {
                     clearInterval(orderTimer);
                  }
               }
               
               // if (queryValues.toggle_interval) {
               //    const interval = parseInt(queryValues.toggle_interval * 1000); // seconds
               //    const timer = setTimeout(() => {
               //       props.history.push(`/zendesk?toggle_interval=${queryValues.toggle_interval}`);
               //    }, 3000);
               //    return () => clearTimeout(timer);
               // }
            }
         })
         .catch(err => console.log(err));
   }, [props.location.search, props.history]);

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
      <div className='dashboard'>
         <div className='dashboard-panel client-count-panel'>
            {
               clientCount
               ?
               <>
                  <p className='panel-header'>Stuck Orders by Client ({orderData.stuck_orders.length})</p>
                  <div className='chart-container'>
                     <ClientCountPanel clientNames={clientNames} clientCount={clientCount}/>
                  </div>
               </>
               :
               <div className='grid-loader-container'>
                  <GridLoader size={12} loading={true} color={'#A5368D'} />
               </div>
            }
         </div>
         
         <div className='dashboard-panel alert-panel'>
            {
               alertCount
               ?
               <>
                  <p className='panel-header'>Alerts</p>
                  <div className='chart-container'>
                     {
                        orderData && alertCount.length === 0
                        ?
                        <div className='no-alerts-container'>
                           <i className="far fa-check-square"></i>
                           <p>All Caught Up!</p>
                        </div>
                        :
                        <AlertPanel alertCount={alertCount} />
                     }
                  </div>
               </>
               :
               <div className='grid-loader-container'>
                  <GridLoader size={12} loading={true} color={'#016C59'} />
               </div>
            }
         </div>

         <div className='dashboard-panel status-day-count-panel'>
            {
               statusDayCount
               ?
               <>
                  <p className='panel-header'>Current Status Age</p>
                  <div className='chart-container'>
                     <StatusDayCountPanel statusDayCount={statusDayCount} />
                  </div>
               </>
               :
               <div className='grid-loader-container'>
                  <GridLoader size={12} loading={true} color={'#3690C0'} />
               </div>
            }         
         </div>

         <div className='dashboard-panel approval-day-count-panel'>
            {
               approvalDayCount
               ?
               <>
                  <p className='panel-header'>Approval Age</p>
                  <div className='chart-container'>
                     <ApprovalDayCountPanel approvalDayCount={approvalDayCount} />
                  </div>
               </>
               :
               <div className='grid-loader-container'>
                  <GridLoader size={12} loading={true} color={'#800026'} />
               </div>
            }
         </div>

         {
            // don't display Details Link if fetch_interval param is provided
            !queryString.parse(props.location.search).fetch_interval
            &&
            <div className='link-container'>
               <Link to='/zendesk'>
                  <div className='zendesk-link dashboard-link'>
                     <p>Zendesk</p>
                  </div>
               </Link>
               <p>|</p>
               <Link to='/details'>
                  <div className='details-link dashboard-link'>
                     <i className="fas fa-info-circle"></i>
                     <p>Details</p>
                  </div>
               </Link>
            </div>
         }
      </div>
   );
}
