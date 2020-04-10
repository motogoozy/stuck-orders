import React from 'react';
import './ClientCountPanel.scss';

import { ResponsiveBar } from '@nivo/bar';

export default function ClientCountPanel(props) {
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
				}
			},
		}
	};

	return (
		<div className='dashboard-panel client-count-panel'>
			<p className='panel-header'>Stuck Orders by Client</p>
			<div className='chart-container'>
				<ResponsiveBar
					data={props.clientCount}
					keys={[ 'Non-Expedited', 'Expedited' ]}
					indexBy="client"
					margin={{ top: 5, right: 125, bottom: 80, left: 50 }}
					padding={0.3}
					layout="vertical"
					colors={[ '#4393C3', '#D6604D' ]}
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
							legendOffset: -40,
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
								translateX: 120,
								translateY: 0,
								itemsSpacing: 2,
								itemWidth: 100,
								itemHeight: 20,
								itemDirection: 'left-to-right',
								itemOpacity: 0.85,
								itemTextColor: 'white',
								symbolSize: 20,
								effects: [
									{
											on: 'hover',
											style: {
												itemOpacity: 1
											}
									}
								]
							}
					]}
					animate={true}
					motionStiffness={90}
					motionDamping={15}
				/>
			</div>
		</div>
	)
}
