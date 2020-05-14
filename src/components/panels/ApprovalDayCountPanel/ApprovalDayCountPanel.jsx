import React from 'react';
import './ApprovalDayCountPanel.scss';

import { useHistory } from 'react-router-dom';
import { ResponsiveBar } from '@nivo/bar';

export default function ApprovalDayCountPanel(props) {
	const history = useHistory();

	const theme = {
		axis: {
			ticks: {
				text: {
					fill: 'white',
					fontSize: '.9rem',
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
	// const colors = {
	// 	'0': '#FFF7FB',
	// 	'1': '#E7E1EF',
	// 	'2': '#D0D1E6',
	// 	'3': '#A6BDDB',
	// 	'4': '#67A9CF',
	// 	'5': '#3690C0',
	// 	'6': '#02818A',
	// 	'7': '#016C59',
	// 	'8+': '#014636'
	// };

	// greens
	const colors = {
		'0': '#F7FCF5',
		'1': '#E5F5E0',
		'2': '#C7E9C0',
		'3': '#A1D99B',
		'4': '#74C476',
		'5': '#41AB5D',
		'6': '#238B44',
		'7': '#006D2C',
		'8+': '#00441C'
	};

	const getColors = bar => colors[bar.indexValue];

	return (
		<ResponsiveBar
			onClick={event => history.push(`/details?approval_age=${event.data.day}`)}
			data={props.approvalDayCount}
			keys={[ 'Day' ]}
			indexBy="day"
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
				tickRotation: -0,
				legend: 'Days',
				legendPosition: 'middle',
				legendOffset: 70,
			}}
			axisLeft={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: 'Total Orders',
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
