import React from 'react';
import { formatOrganization } from '../../../utils/zendeskUtils';

// import { useHistory } from 'react-router-dom';
import { ResponsiveBar } from '@nivo/bar';

export default function AgentCountByOrganizationPanel(props) {
  // const history = useHistory();

  const theme = {
    axis: {
      ticks: {
        text: {
          fill: 'white',
          fontSize: '.8rem',
          letterSpacing: '.25px',
        },
      },
      legend: {
        text: {
          fill: 'white',
          fontSize: '1rem',
        },
      },
    },
    labels: {
      text: {
        fontSize: '.9rem',
        fontWeight: 'bold',
      },
    },
  };

  const getKeys = data => {
    let keys = [];
    data.forEach(org => {
      let objKeys = Object.keys(org);
      objKeys.forEach(objKey => {
        if (objKey !== 'organization' && objKey !== 'formattedOrgName' && !keys.includes(objKey)) {
          keys.push(objKey);
        }
      });
    });

    return keys;
  };

  return (
    <ResponsiveBar
      data={props.agentCountByOrganization.map(org => formatOrganization(org))}
      keys={getKeys(props.agentCountByOrganization)}
      indexBy='formattedOrgName'
      groupMode={props.groupMode || 'stacked'}
      margin={{ top: 5, right: 100, bottom: 80, left: 60 }}
      padding={0.3}
      layout='vertical'
      colors={{ scheme: 'set3' }}
      minValue='auto'
      colorBy='id'
      theme={theme}
      enableGridX={false}
      enableGridY={true}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -30,
        legend: 'Organization',
        legendPosition: 'middle',
        legendOffset: 70,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Count',
        legendPosition: 'middle',
        legendOffset: -50,
      }}
      legends={[
        {
          dataFrom: 'keys',
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 110,
          translateY: -10,
          itemsSpacing: 20,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: 'top-to-bottom',
          itemOpacity: 1,
          itemTextColor: 'white',
          symbolSize: 10,
          // effects: [{
          // 	on: 'hover',
          // 	style: {
          // 		itemOpacity: 1
          // 	}
          // }]
        },
      ]}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={'black'}
      animate={true}
      motionStiffness={90}
      motionDamping={15}
    />
  );
}
