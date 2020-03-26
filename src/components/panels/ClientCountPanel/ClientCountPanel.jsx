import React, { useState, useEffect } from 'react';
import './ClientCountPanel.scss';

import { ResponsiveBar } from '@nivo/bar';
import { linearGradientDef } from '@nivo/core';

export default function ClientCountPanel(props) {
	const theme = {
		axis: {
			ticks: {
				text: {
					fill: 'white'
				},
			},
			legend: {
				text: {
					fill: 'white'
				}
			}
		}
	};

	return (
		<div className='dashboard-panel client-count-panel'>
			<p className='panel-header'>Stuck Orders</p>
			<div className='chart-container'>
				<ResponsiveBar
					data={props.expeditedCount}
					keys={[ 'Non-Expedited', 'Expedited' ]}
					indexBy="client"
					margin={{ top: 0, right: 0, bottom: 100, left: 50 }}
					padding={0.3}
					layout="vertical"
					colors={{ scheme: 'spectral' }}
					colorBy='index'
					theme = {theme}
					borderRadius={5}
					enableGridX={false}
					enableGridY={true}
					defs={[
						{
							id: 'lines',
							type: 'patternLines',
							background: 'white',
							color: 'inherit',
							rotation: -45,
							lineWidth: 7,
							spacing: 8,
						},
						linearGradientDef('gradientA', [
							{ offset: 0, color: 'inherit' },
							{ offset: 0, color: 'inherit', opacity: .75}

						])
					]}
					fill={[
						{
							match: {
								id: 'Non-Expedited'
							},
							id: 'gradientA'
						}
					]}
					axisTop={null}
					axisRight={null}
					axisBottom={{
							tickSize: 5,
							tickPadding: 5,
							tickRotation: -30,
							legend: 'Client',
							legendPosition: 'middle',
							legendOffset: 75,
					}}
					axisLeft={{
							tickSize: 5,
							tickPadding: 5,
							tickRotation: 0,
							legend: 'Total',
							legendPosition: 'middle',
							legendOffset: -40,
					}}
					labelSkipWidth={12}
					labelSkipHeight={12}
					labelTextColor={'white'}
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
					animate={true}
					motionStiffness={90}
					motionDamping={15}
				/>
			</div>
		</div>
	)
}
