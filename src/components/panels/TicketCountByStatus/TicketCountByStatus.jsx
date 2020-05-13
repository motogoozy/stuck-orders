import React from 'react';

import { ResponsiveBar } from '@nivo/bar';

export default function TicketCountByStatus(props) {
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
				}
			},
		},
		labels: {
			text: {
				fontSize: '.9rem',
				fontWeight: 'bold'
			}
		}
	};

	return (
		<ResponsiveBar
			data={props.countByStatus}
			keys={[ 'Count' ]}
			indexBy="status"
			margin={{ top: 5, right: 0, bottom: 85, left: 50 }}
			padding={0.3}
			layout="vertical"
			colors={{ scheme: 'nivo' }}
			colorBy='index'
			theme={theme}
			enableGridX={false}
			enableGridY={true}
			axisTop={null}
			axisRight={null}
			axisBottom={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: -22,
				legend: 'Status',
				legendPosition: 'middle',
				legendOffset: 70,
			}}
			axisLeft={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: 'Count',
				legendPosition: 'middle',
				legendOffset: -40,
			}}
			labelSkipWidth={12}
			labelSkipHeight={12}
			labelTextColor={'black'}
			animate={true}
			motionStiffness={90}
			motionDamping={15}
		/>
	)
}
