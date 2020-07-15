import axios from 'axios';
import moment from 'moment';

export async function fetchData(url, config) {
  try {
    let res = await axios.get(url, config);
    return res.data;
  } catch (err) {
    console.log(err);
    throw Error(`Unable to fetch data at this time.`);
  }
}

export const formatDate = dateObj => {
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

export const formatAge = hrs => {
  let days = Math.floor(hrs / 24);
  let hoursMinutes;

  if (hrs === 0) {
    return '00:00 hrs';
  }

  if (days > 0) {
    let remainder = hrs % 24;
    let plural = days > 1;
    hoursMinutes = moment.duration(remainder, 'hours').format('hh:mm');
    return `${days} ${plural ? 'days' : 'day'} ${remainder !== 0 ? hoursMinutes : ''}`;
  } else {
    hoursMinutes = moment.duration(hrs, 'hours').format('hh:mm');
    return `${hoursMinutes} hrs`;
  }
};

export const randomizePanels = panelNames => {
  let displayPanels = [];

  while (displayPanels.length < 4) {
    let remainingIndexes = panelNames.length;
    let randomIndex = Math.floor(Math.random() * Math.floor(remainingIndexes));
    let removed = panelNames.splice(randomIndex, 1)[0];
    displayPanels.push(removed);
  }

  return displayPanels;
};

export const stuckOrdersUtils = {
  getClientCount: orderData => {
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
        clients[order.client].client = `${order.client_db_name} (${
          clients[order.client]['Total']
        })`;
      } else {
        clients[order.client]['Standard']++;
        clients[order.client]['Total']++;
        clients[order.client].client = `${order.client_db_name} (${
          clients[order.client]['Total']
        })`;
      }
    });

    const clientsArr = [];
    for (let client in clients) {
      clientsArr.push(clients[client]);
    }

    return clientsArr;
  },

  getAlertCount: orderData => {
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
  },

  getStatusDayCount: orderData => {
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
  },

  getApprovalDayCount: orderData => {
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
  },

  exportDataToCSV: orderData => {
    const headers = Object.keys(orderData.stuck_orders[0]).sort((a, b) => {
      if (a < b) return -1;
      else if (a > b) return 1;
      else return 0;
    });
    const rows = orderData.stuck_orders.map(order => headers.map(header => order[header]));

    return [headers, ...rows];
  },

  getFileName: () => {
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString().split(' ').join('');

    return `stuck_orders_${month}_${day}_${year}_${time}.csv`;
  },
};

export const zendeskUtils = {
  getTicketCountByAgent: ticketData => {
    let agents = {};
    ticketData.forEach(ticket => {
      let capitalizedStatus = ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
      agents[ticket.agent] = agents[ticket.agent] || {
        agent: ticket.agent,
        New: 0,
        Open: 0,
        Pending: 0,
        Solved: 0,
        Closed: 0,
      };
      agents[ticket.agent][capitalizedStatus] = agents[ticket.agent][capitalizedStatus] + 1;
    });

    let agentsArr = [];
    for (let agent in agents) {
      agentsArr.push(agents[agent]);
    }

    let sortedAgentsArr = agentsArr.sort((a, b) => {
      if (a.agent > b.agent) return 1;
      else if (a.agent < b.agent) return -1;
      return 0;
    });

    return sortedAgentsArr;
  },

  getTicketCountByOrg: ticketData => {
    let orgs = {};
    ticketData.forEach(ticket => {
      orgs[ticket.organization] = orgs[ticket.organization] || {
        organization: ticket.organization,
        Count: 0,
      };
      orgs[ticket.organization].Count++;
    });

    let orgsArr = [];
    for (let organization in orgs) {
      orgsArr.push(orgs[organization]);
    }

    let sortedOrgsArr = orgsArr.sort((a, b) => {
      if (a.organization > b.organization) return 1;
      else if (a.organization < b.organization) return -1;
      return 0;
    });

    return sortedOrgsArr;
  },

  getTicketCountByStatus: ticketData => {
    let statuses = {
      new: { status: 'New', Count: 0 },
      open: { status: 'Open', Count: 0 },
      pending: { status: 'Pending', Count: 0 },
      solved: { status: 'Solved', Count: 0 },
      closed: { status: 'Closed', Count: 0 },
    };

    ticketData.forEach(ticket => {
      statuses[ticket.status].Count++;
    });

    let statusesArr = [];
    for (let status in statuses) {
      statusesArr.push(statuses[status]);
    }

    return statusesArr;
  },

  getTicketCountByAge: ticketData => {
    let ages = {};
    ticketData.forEach(ticket => {
      const now = moment();
      const createdAt = moment(new Date(ticket.created_at));
      const difference = now.diff(createdAt, 'days');

      if (difference < 8) {
        ages[difference.toString()] = ages[difference.toString()] || {
          age: difference.toString(),
          Day: 0,
        };
        ages[difference.toString()].Day++;
      } else {
        ages['8+'] = ages['8+'] || { age: '8+', Day: 0 };
        ages['8+'].Day++;
      }
    });

    let agesArr = [];
    for (let age in ages) {
      agesArr.push(ages[age]);
    }

    let sortedAgesArr = agesArr.sort((a, b) => {
      if (parseInt(a.age) > parseInt(b.age)) return 1;
      else if (parseInt(a.age) < parseInt(b.age)) return -1;
      return 0;
    });

    return sortedAgesArr;
  },

  getAgentCountByOrg: ticketData => {
    let orgs = {}; // map of organization names with array of agent names
    ticketData.forEach(ticket => {
      let agentFirstName = '';
      let agentLastInitial = '';
      let agentDisplayName;
      if (ticket.agent.split(' ').length > 1) {
        agentFirstName = ticket.agent.split(' ')[0];
        agentLastInitial = ticket.agent.split(' ')[1].charAt(0).toUpperCase();
        agentDisplayName = `${agentFirstName} ${agentLastInitial}.`;
      } else {
        agentDisplayName = ticket.agent;
      }

      orgs[ticket.organization] = orgs[ticket.organization] || {
        organization: ticket.organization,
      };

      if (ticket.status !== 'solved' && ticket.status !== 'closed') {
        orgs[ticket.organization][agentDisplayName] =
          orgs[ticket.organization][agentDisplayName] + 1 || 1;
      }
    });

    let orgsArr = [];
    for (let org in orgs) {
      orgsArr.push(orgs[org]);
    }

    let sortedOrgsArr = orgsArr.sort((a, b) => {
      if (a.organization > b.organization) return 1;
      else if (a.organization < b.organization) return -1;
      return 0;
    });

    return sortedOrgsArr;
  },
};
