import React from 'react';
import './AlertPanel.scss';

import { ResponsiveBar } from '@nivo/bar';

export default function AlertPanel(props) {
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
		}
	};

	const colors = {
		'Pending Order': '#FDBB84',
		'Std. Aged Order': '#FC8D59',
		'Exp. Aged Order': '#EF6548',
		'Std. Approval': '#D73020',
		'Exp. Approval': '#B30000',
	};

	const getColors = bar => colors[bar.indexValue];

	return (
		<div className='dashboard-panel status-day-count-panel'>
			<p className='panel-header'>Alerts</p>
			<div className='chart-container'>
				<ResponsiveBar
					data={props.alertCount}
					keys={[ 'Count' ]}
					indexBy="alertName"
					margin={{ top: 5, right: 0, bottom: 85, left: 50 }}
					padding={0.3}
					layout="vertical"
					// colors={[ '#CE1256', '#2B8CBE', '#41AE76', '#FC8D59', '#807DBA' ]}
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
							tickRotation: -30,
							legend: 'Type',
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
					// legends={[
					// 		{
					// 			dataFrom: 'keys',
					// 			anchor: 'bottom-right',
					// 			direction: 'column',
					// 			justify: false,
					// 			translateX: 120,
					// 			translateY: 0,
					// 			itemsSpacing: 2,
					// 			itemWidth: 100,
					// 			itemHeight: 20,
					// 			itemDirection: 'left-to-right',
					// 			itemOpacity: 0.85,
					// 			itemTextColor: 'white',
					// 			symbolSize: 20,
					// 			effects: [
					// 				{
					// 						on: 'hover',
					// 						style: {
					// 							itemOpacity: 1
					// 						}
					// 				}
					// 			]
					// 		}
					// ]}
					// defs={[
					// 	{
					// 		id: 'lines',
					// 		type: 'patternLines',
					// 		background: 'white',
					// 		color: 'inherit',
					// 		rotation: -45,
					// 		lineWidth: 7,
					// 		spacing: 8,
					// 	},
					// 	linearGradientDef('gradientA', [
					// 		{ offset: 0, color: 'inherit' },
					// 		{ offset: 0, color: 'inherit', opacity: .75}
					// 	])
					// ]}
					// fill={[
					// 	{
					// 		match: {
					// 			id: 'Non-Expedited'
					// 		},
					// 		id: 'gradientA'
					// 	}
					// ]}
					animate={true}
					motionStiffness={90}
					motionDamping={15}
				/>
			</div>
		</div>
	)
}
