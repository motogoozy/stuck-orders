import React from 'react';
import './StuckOrdersByClientPanel.scss';
import { formatClient } from '../../../utils/stuckOrdersUtils';

import { useHistory } from 'react-router-dom';
import { ResponsiveBar } from '@nivo/bar';

export default function StuckOrdersByClientPanel(props) {
  const history = useHistory();

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

  const handleClientSelection = event => {
    const clientName = props.clientNames[event.data.client.split(' ')[0]];
    const expedited = event.id === 'Expedited' ? true : false;
    history.push(`/details?client=${clientName}&expedited=${expedited}`);
  };

  return (
    <ResponsiveBar
      onClick={event => handleClientSelection(event)}
      data={props.stuckOrdersByClient.map(client => formatClient(client))}
      keys={['Standard', 'Expedited']}
      indexBy='formattedClientName'
      margin={{ top: 5, right: 100, bottom: 80, left: 60 }}
      padding={0.3}
      layout='vertical'
      colors={['#4393C3', '#D6604D']}
      minValue='auto'
      // colors={[ '#0dc6ab', '#a5368d' ]}
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
        legend: 'Client',
        legendPosition: 'middle',
        legendOffset: 70,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Total Orders',
        legendPosition: 'middle',
        legendOffset: -50,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={'white'}
      legends={[
        {
          dataFrom: 'keys',
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 110,
          translateY: -20,
          itemsSpacing: 35,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: 'top-to-bottom',
          itemOpacity: 1,
          itemTextColor: 'white',
          symbolSize: 20,
          // effects: [{
          // 	on: 'hover',
          // 	style: {
          // 		itemOpacity: 1
          // 	}
          // }]
        },
      ]}
      animate={true}
      motionStiffness={90}
      motionDamping={15}
    />
  );
}
