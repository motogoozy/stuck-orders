import moment from 'moment';

export const getTicketCountByAgent = ticketData => {
  let agents = {};
  ticketData.forEach(ticket => {
    let capitalizedStatus = ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
    agents[ticket.agent] = agents[ticket.agent] || {
      agent: ticket.agent,
      New: 0,
      Open: 0,
      Pending: 0,
      Hold: 0,
      Solved: 0,
      Closed: 0,
    };
    agents[ticket.agent][capitalizedStatus] = agents[ticket.agent][capitalizedStatus] + 1 || 1;
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
};

export const getTicketCountByOrg = ticketData => {
  let orgs = {};
  ticketData.forEach(ticket => {
    orgs[ticket.organization] = orgs[ticket.organization] || {
      organization: ticket.organization,
      Count: 0,
    };
    if (orgs[ticket.organization]) {
      orgs[ticket.organization].Count++;
    }
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
};

export const getTicketCountByStatus = ticketData => {
  let statuses = {
    new: { status: 'New', Count: 0 },
    open: { status: 'Open', Count: 0 },
    pending: { status: 'Pending', Count: 0 },
    hold: { status: 'Hold', Count: 0 },
    solved: { status: 'Solved', Count: 0 },
    closed: { status: 'Closed', Count: 0 },
  };

  ticketData.forEach(ticket => {
    if (statuses[ticket.status]) {
      statuses[ticket.status].Count++;

    }
  });

  let statusesArr = [];
  for (let status in statuses) {
    statusesArr.push(statuses[status]);
  }

  return statusesArr;
};

export const getTicketCountByAge = ticketData => {
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
};

export const getAgentCountByOrg = ticketData => {
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
      orgs[ticket.organization][agentDisplayName] = orgs[ticket.organization][agentDisplayName] + 1 || 1;
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
};

export const formatOrganization = org => {
  if (org.organization.length > 13) {
    org.formattedOrgName = `${org.organization.slice(0, 13)}...`;
  } else {
    org.formattedOrgName = org.organization;
  }

  return org;
};

export const formatAgent = agent => {
  const nameArr = agent.agent.split(' ');

  if (nameArr.length > 1) {
    const firstName = nameArr[0];
    const lastName = nameArr[1];
    const lastInitial = lastName.split('')[0].toUpperCase();
    agent.formattedAgentName = `${firstName} ${lastInitial}.`;
  } else {
    agent.formattedAgentName = agent.agent;
  }

  return agent;
};
