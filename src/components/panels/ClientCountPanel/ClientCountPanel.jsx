import React, { useState, useEffect } from 'react';
import './ClientCountPanel.scss';

import { ResponsiveBar } from '@nivo/bar';

export default function ClientCountPanel(props) {
	useEffect(() => {
		console.log(props.expeditedCount)
	}, [props.expeditedCount])
	const theme = {
		axis: {
			ticks: {
				text: {
					fill: 'white'
				}
			},
			legend: {
				text: {
					fill: 'white'
				}
			}
		}
	}

	return (
		<div className='dashboard-panel client-count-panel'>
			<p style={{ color: 'white' }}>Stuck Orders</p>
			<ResponsiveBar
				data={props.expeditedCount}
				keys={[ 'Non-Expedited', 'Expedited' ]}
				indexBy="client"
				margin={{ top: 0, right: 150, bottom: 50, left: 150 }}
				padding={0.3}
				layout="horizontal"
				colors={['#8b2abb', '#ef7a00']}
				theme = {theme}
				// borderWidth={3}
				// borderColor={'white'}
				borderRadius={5}
				index='color'
				axisTop={null}
				axisRight={null}
				axisBottom={{
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0,
						legend: 'Total',
						legendPosition: 'middle',
						legendOffset: 40,
				}}
				axisLeft={{
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0,
						legend: 'Client',
						legendPosition: 'middle',
						legendOffset: -100
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
	)
}
