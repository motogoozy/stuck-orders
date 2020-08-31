export const getStuckOrdersByClient = orderData => {
  let clients = {};
  orderData.stuck_orders.forEach(order => {
    clients[order.client] = clients[order.client] || {
      client: order.client_db_name,
      Expedited: 0,
      Standard: 0,
      Total: 0,
    };
    if (order.expedited) {
      clients[order.client]['Expedited']++;
      clients[order.client]['Total']++;
      clients[order.client].client = `${order.client_db_name} (${clients[order.client]['Total']})`;
    } else {
      clients[order.client]['Standard']++;
      clients[order.client]['Total']++;
      clients[order.client].client = `${order.client_db_name} (${clients[order.client]['Total']})`;
    }
  });

  const clientsArr = [];
  for (let client in clients) {
    clientsArr.push(clients[client]);
  }

  return clientsArr;
};

export const getAlertCount = orderData => {
  let alerts = {
    expedited_approval_alert: {
      alertName: 'Exp. Approved 4+',
      dbName: 'expedited_approval_alert',
      Count: 0,
    },
    standard_approval_alert: {
      alertName: 'Std. Approved 24+',
      dbName: 'standard_approval_alert',
      Count: 0,
    },
    aged_order_gte_72_lt_96_alert: {
      alertName: 'Pending Orders 72+',
      dbName: 'aged_order_gte_72_lt_96_alert',
      Count: 0,
    },
    aged_order_gte_96_alert: {
      alertName: 'Pending Orders 96+',
      dbName: 'aged_order_gte_96_alert',
      Count: 0,
    },
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
  )
    return [];

  return alertsArr;
};

export const getApprovedOrdersByClient = orderData => {
  let clients = {};

  orderData.stuck_orders.forEach(order => {
    clients[order.client] = clients[order.client] || {
      client: order.client_db_name,
      Expedited: 0,
      Standard: 0,
      Total: 0,
    };

    if (order.order_status === 'Approved') {
      if (order.expedited) {
        clients[order.client]['Expedited']++;
        clients[order.client]['Total']++;
        clients[order.client].client = `${order.client_db_name} (${clients[order.client]['Total']})`;
      } else {
        clients[order.client]['Standard']++;
        clients[order.client]['Total']++;
        clients[order.client].client = `${order.client_db_name} (${clients[order.client]['Total']})`;
      }
    }
  });

  const clientsArr = [];
  for (let client in clients) {
    clientsArr.push(clients[client]);
  }

  return clientsArr;
};

export const getStatusAgeCount = orderData => {
  let days = {};
  for (let i = 0; i <= 8; i++) {
    if (i === 8) {
      days['8+'] = { day: '8+', Day: 0 };
    } else {
      days[i.toString()] = { day: i.toString(), Day: 0 };
    }
  }

  orderData.stuck_orders.forEach(order => {
    const statusAgeInDays = Math.floor(order.status_change_business_age / 24);

    if (statusAgeInDays >= 8) {
      days['8+']['Day']++;
    } else {
      days[statusAgeInDays.toString()]['Day']++;
    }
  });

  let statusDaysArr = [];
  for (let day in days) {
    statusDaysArr.push(days[day]);
  }

  return statusDaysArr;
};

export const getApprovalDayCount = orderData => {
  let days = {};
  for (let i = 0; i <= 8; i++) {
    if (i === 8) {
      days['8+'] = { day: '8+', Day: 0 };
    } else {
      days[i.toString()] = { day: i.toString(), Day: 0 };
    }
  }

  orderData.stuck_orders.forEach(order => {
    const approvalAgeInDays = Math.floor(order.approval_business_age / 24);

    if (approvalAgeInDays >= 8) {
      days['8+']['Day']++;
    } else {
      days[approvalAgeInDays.toString()]['Day']++;
    }
  });

  const approvalDaysArr = [];
  for (let day in days) {
    approvalDaysArr.push(days[day]);
  }

  return approvalDaysArr;
};

export const exportDataToCSV = orderData => {
  const headers = Object.keys(orderData.stuck_orders[0]).sort((a, b) => {
    if (a < b) return -1;
    else if (a > b) return 1;
    else return 0;
  });
  const rows = orderData.stuck_orders.map(order => headers.map(header => order[header]));

  return [headers, ...rows];
};

export const createFileName = () => {
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString().split(' ').join('');

  return `stuck_orders_${month}_${day}_${year}_${time}.csv`;
};

export const formatClient = client => {
  let clientArr = client.client.split(' ');
  let clientName = clientArr[0];
  let clientCount = clientArr[1];

  if (clientName.length > 11) {
    client.formattedClientName = `${client.client.slice(0, 11)}...${clientCount}`;
  } else {
    client.formattedClientName = client.client;
  }

  return client;
};
