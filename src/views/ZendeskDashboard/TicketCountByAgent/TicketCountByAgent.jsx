import React from 'react';

import { ResponsiveBar } from '@nivo/bar';

export default function TicketCountByAgent(props) {
  const theme = {
    axis: {
      ticks: {
        text: {
          fill: 'white',
          fontSize: '.8rem',
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
        if (objKey !== 'agent' && !keys.includes(objKey)) {
          keys.push(objKey);
        }
      });
    });

    return keys;
  };

  return (
    <ResponsiveBar
      data={props.ticketCountByAgent}
      keys={getKeys(props.ticketCountByAgent)}
      indexBy='agent'
      groupMode='grouped'
      margin={{ top: 5, right: 100, bottom: 80, left: 60 }}
      padding={0.3}
      layout='vertical'
      // colors={{ scheme: 'set2' }}
      colors={['#B2182B', '#FC8D62', '#FFED6F', '#66C2A5', '#1B7837']}
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
        legend: 'Agent',
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
