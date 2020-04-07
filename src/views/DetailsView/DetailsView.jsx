import React, { useState, useEffect } from 'react';
import './DetailsView.scss';
import '../../../node_modules/@fortawesome/fontawesome-free/css/all.css';
import { getOrderData } from '../../App.js';
import { formatDate } from '../../utils.js';

import GridLoader from 'react-spinners/GridLoader';
import { Link } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

export default function DetailsView() {
	const [orderData, setOrderData] = useState('');

	useEffect(() => {
		getOrderData().then(data => {
			setOrderData(data);
		});
	}, []);

	const displayRows = () => {
		let rows = orderData.stuck_orders.map(order => {
			return (
				<div className='order-detail-row' key={order.order_number}>
					<p className='detail-client'>{order.client}</p>
					<p className='detail-expedited'>{order.expedited.toString()}</p>
					<p className='detail-order-status'>{order.order_status}</p>
					<p className='detail-status-change'>{order.status_change_business_age} {order.status_change_business_age > 1 ? 'hrs' : 'hr'}</p>
					<OverlayTrigger
						trigger={['hover', 'focus']}
						placement="right"
						overlay={
							<Popover id="popover-basic">
								{/* <Popover.Title as="h3">Details</Popover.Title> */}
								<Popover.Content>
									<strong style={{ color: '#02818A' }}>Approval Age</strong>
									<br/>
									<span>Business Hours: {order.approval_business_age} hours</span>
									<br/>
									<span>Raw Hours: {order.approval_raw_age} hours</span>
									<br/>
									<span>Timestamp: {formatDate(new Date(order.approval_timestamp))}</span>

									<br/>
									<br/>

									<strong style={{ color: '#02818A' }}>Order Age</strong>
									<br/>
									<span>Business Hours: {order.order_business_age} hours</span>
									<br/>
									<span>Raw Hours: {order.order_raw_age} hours</span>
									<br/>
									<span>Timestamp: {formatDate(new Date(order.order_timestamp))}</span>
									
								</Popover.Content>
							</Popover>
						}
					>
						<p className='detail-approval-order' style={{ display: 'inline-block', whiteSpace: 'pre-wrap' }} id={`order-${order.order_number}`}>{order.approval_business_age} {order.approval_business_age > 1 ? 'hrs' : 'hr'} / {order.order_business_age} {order.order_business_age > 1 ? 'hrs' : 'hr'}</p>
					</OverlayTrigger>
					<p className='detail-subscriber-name'>{order.subscriber_name}</p>
					<p className='detail-service-number'>{order.service_number}</p>
					<p className='detail-order-type'>{order.order_type}</p>
					<p className='detail-make'>{order.make}</p>
					<p className='detail-model'>{order.model}</p>
					<p className='detail-carrier'>{order.carrier}</p>
					<p className='detail-notes'>{order.notes}</p>
				</div>
			)
		});
		return rows;
	};

	/*
	- sortable on any of the columns
	- filterable by client, expedited, order_status
	- searchable by service_number, client, order_number

	status_change_timestamp: "2020-02-25T16:00:03.299836-07:00"
	order_timestamp: "2020-02-25T15:46:06.927024-07:00"
	expedited_approval_alert: false
	approval_raw_age: 982
	device_type: "iPhone"
	client_db_name: "avis"
	order_type: "Equipment Upgrade"
	order_business_age: 694
	standard_aged_order_alert: true
	expedited_aged_order_alert: false
	report_timestamp: "2020-04-06T15:17:52.100374-06:00"
	carrier: "Verizon"
	order_status: "Approved"
	order_raw_age: 982
	approval_business_age: 694
	approval_timestamp: "2020-02-25T16:00:03.299836-07:00"
	standard_approval_alert: true
	status_change_raw_age: 982
	pending_order_alert: false
	subscriber_name: "Pierce, Donald A"
	service_number: "6502704069"
	notes: null
	expedited: false
	client: "Avis"
	status_change_business_age: 694
	model: "iPhone 8 64GB"
	order_number: "15163-15545"
	make: "Apple"
	*/

	return (
		<div className='details-view-main'>
			<div className='details-view-header'>
				<Link to='/'>
					<i className="fas fa-arrow-left details-back-arrow"></i>
				</Link>
				{
					orderData
					&&
					<div className='details-view-header-right-container'>
						<p>Reset</p>
						<input type='text' placeholder='Search client, order number, phone' />
					</div>
				}
			</div>
			{
				orderData
				?
				<div className='details-table'>
					<div className='details-table-header'>
						<p className='detail-client'>Client</p>
						<p className='detail-expedited'>Expedited</p>
						<p className='detail-order-status'>Order Status</p>
						<p className='detail-status-change'>Status Age</p>
						<p className='detail-approval'>Approval / Order Age</p>
						<p className='detail-subscriber-name'>Subscriber Name</p>
						<p className='detail-service-number'>Service Number</p>
						<p className='detail-order-type'>Order Type</p>
						<p className='detail-make'>Make</p>
						<p className='detail-model'>Model</p>
						<p className='detail-carrier'>Carrier</p>
						<p className='detail-notes'>Notes</p>
					</div>
					<div className='details-table-filter-row'>
						<select className='detail-client' name="" id=""></select>
						<select className='detail-expedited' name="" id=""></select>
						<select className='detail-order-status' name="" id=""></select>
						<select className='detail-status-change' name="" id=""></select>
						<select className='detail-approval' name="" id=""></select>
						<select className='detail-subscriber-name' name="" id=""></select>
						<select className='detail-service-number' name="" id=""></select>
						<select className='detail-order-type' name="" id=""></select>
						<select className='detail-make' name="" id=""></select>
						<select className='detail-model' name="" id=""></select>
						<select className='detail-carrier' name="" id=""></select>
						<select className='detail-notes' name="" id=""></select>
					</div>
					<div className='details-table-body'>
						{ displayRows() }
					</div>
				</div>
				:
				<div className='detail-loader'>
					<GridLoader size={12} loading={true} color={'white'} />
				</div>
			}
		</div>
	)
}
