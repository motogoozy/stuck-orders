import React from 'react';

import { ResponsiveBar } from '@nivo/bar';

export default function TicketCountByAge(props) {
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

		// purple_blue_green
	const colors = {
		'0': '#FFF7FB',
		'1': '#E7E1EF',
		'2': '#D0D1E6',
		'3': '#A6BDDB',
		'4': '#67A9CF',
		'5': '#3690C0',
		'6': '#02818A',
		'7': '#016C59',
		'8+': '#014636'
	};

	const getColors = bar => colors[bar.indexValue];

	return (
		<ResponsiveBar
			data={props.ticketCountByAge}
			keys={[ 'Day' ]}
			indexBy="age"
			margin={{ top: 5, right: 0, bottom: 85, left: 50 }}
			padding={0.3}
			layout="vertical"
			// colors={{ scheme: 'purple_blue_green' }}
			colors={getColors}
			colorBy='index'
			theme={theme}
			enableGridX={false}
			enableGridY={true}
			axisTop={null}
			axisRight={null}
			axisBottom={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: 'Age',
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
