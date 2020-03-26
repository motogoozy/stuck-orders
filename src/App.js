import React, { useState, useEffect } from 'react';
import './App.scss';
import ClientCountPanel from './components/panels/ClientCountPanel/ClientCountPanel';
import HighPriorityPanel from './components/panels/HighPriorityPanel/HighPriorityPanel';

import axios from 'axios';

function App() {
   const [orderData, setOrderData] = useState();
   const [expeditedCount, setExpeditedCount] = useState([]);
   const [highPriorities, setHighPriorities] = useState([]);

   useEffect(() => {
      const getOrderData = async () => {
         try {
            let res = await axios.get('https://stuckorders.mobilsense.com/api/stuck_orders');
            setOrderData(res.data);
            console.log(res.data.stuck_orders)
         } catch (err) {
            console.log(err);
         }
      };
      getOrderData();
   }, []);

   useEffect(() => {
      const getExpeditedCount = () => {
         let clients = {};
         if (orderData) {
            orderData.stuck_orders.forEach(order => {
               clients[order.client] = clients[order.client] || {client: order.client, "Expedited": 0, "Non-Expedited": 0};
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
         setExpeditedCount(clientsArr);
      };

      getExpeditedCount();
   }, [orderData]);

   useEffect(() => {
      const getHighPriorities = () => {
         if (!orderData) return;

         // older than 2 days
         let highPriorities = orderData.stuck_orders.filter(order => {
            let orderDate = new Date(order.order_timestamp);
            let today = new Date();
            if (today.getDate() - orderDate.getDate() > 2) {
               return true;
            } else {
               return false;
            }
         });

         setHighPriorities(highPriorities);
      };

      getHighPriorities();
   }, [orderData])

   return (
      <div className='app'>
         <ClientCountPanel expeditedCount={expeditedCount} />
         <HighPriorityPanel highPriorities={highPriorities} />
         <div className='dashboard-panel'></div>
         <div className='dashboard-panel'></div>
      </div>
   );
}

export default App;