import React from 'react';
import './StatusDayCountPanel.scss';

import { ResponsiveBar } from '@nivo/bar';
import { useHistory } from 'react-router-dom';

export default function StatusDayCountPanel(props) {
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

	// yellow_orange_red
	// const colors = {
	// 	'0': '#FFFFCC',
	// 	'1': '#FFEDA0',
	// 	'2': '#FED976',
	// 	'3': '#FEB24C',
	// 	'4': '#FD8D3D',
	// 	'5': '#FC4E2A',
	// 	'6': '#E31A1C',
	// 	'7': '#BD0026',
	// 	'8+': '#800026'
	// };

	// blue_purple
	// const colors = {
	// 	'0': '#F7FCFD',
	// 	'1': '#E0ECF4',
	// 	'2': '#BFD3E6',
	// 	'3': '#9EBCDA',
	// 	'4': '#8C96C6',
	// 	'5': '#8C6BB1',
	// 	'6': '#88419D',
	// 	'7': '#810F7C',
	// 	'8+': '#4D004B'
	// };
	
	// blues
	const colors = {
		'0': '#F7FBFF',
		'1': '#DEEBF7',
		'2': '#C6DBEF',
		'3': '#9ECAE1',
		'4': '#6BAED6',
		'5': '#4292C6',
		'6': '#2171B5',
		'7': '#08519C',
		'8+': '#08306B'
	};

	const getColors = bar => colors[bar.indexValue];

	return (
		<div className='dashboard-panel status-day-count-panel'>
			<p className='panel-header'>Current Status Age</p>
			<div className='chart-container'>
				<ResponsiveBar
					onClick={event => history.push(`/details?status_age=${event.data.day}`)}
					data={props.statusDayCount}
					keys={[ 'Day' ]}
					indexBy="day"
					margin={{ top: 5, right: 0, bottom: 85, left: 50 }}
					padding={0.3}
					layout="vertical"
					// colors={{ scheme: 'yellow_orange_red' }}
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
			</div>
		</div>
	)
}
