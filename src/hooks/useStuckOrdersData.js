import { useState, useEffect } from 'react';
import {
  getStuckOrdersByClient,
  getAlertCount,
  getApprovedOrdersByClient,
  getStatusAgeCount,
} from '../utils/stuckOrdersUtils';

export default function useStuckOrdersData(initialValue) {
  const [stuckOrdersData, setStuckOrdersData] = useState(initialValue);
  const [stuckOrdersPanelData, setStuckOrdersPanelData] = useState();

  useEffect(() => {
    if (stuckOrdersData) {
      const clientsArr = getStuckOrdersByClient(stuckOrdersData);
      const alertsArr = getAlertCount(stuckOrdersData);
      const approvedArr = getApprovedOrdersByClient(stuckOrdersData);
      const statusDaysArr = getStatusAgeCount(stuckOrdersData);
      const clientNames = {};
      stuckOrdersData.stuck_orders.forEach(order => {
        clientNames[order.client_db_name] = clientNames[order.client_db_name] || order.client;
      });

      setStuckOrdersPanelData({
        stuckOrdersByClient: clientsArr,
        alertCount: alertsArr,
        approvedOrdersByClient: approvedArr,
        statusAgeCount: statusDaysArr,
        clientNames: clientNames,
      });
    }
  }, [stuckOrdersData]);

  return {
    stuckOrdersData,
    setStuckOrdersData,
    stuckOrdersPanelData,
    setStuckOrdersPanelData,
  };
}
