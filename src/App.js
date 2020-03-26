import React, { useState, useEffect } from 'react';
import './App.scss';
import ClientCountPanel from './components/panels/ClientCountPanel/ClientCountPanel';

import axios from 'axios';

function App() {
   const [orderData, setOrderData] = useState('');
   const [expeditedCount, setExpeditedCount] = useState('');

   useEffect(() => {
      const getStuckOrders = async () => {
         try {
            let res = await axios.get('https://stuckorders.mobilsense.com/api/stuck_orders');
            setOrderData(res.data);
         } catch (err) {
            console.log(err);
         }
      };
      getStuckOrders();
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

   return (
      <div className='app'>
         <div className='dashboard-panel'></div>
         <ClientCountPanel expeditedCount={expeditedCount} />
         <div className='dashboard-panel'></div>
         <div className='dashboard-panel'></div>
      </div>
   );
}

export default App;