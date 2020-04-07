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
	const [filterOptions, setFilterOptions] = useState({});
	const [search, setSearch] = useState('');
	const [filters, setFilters] = useState({client: '', expedited: '', order_status: ''});

	useEffect(() => {
		getOrderData().then(data => {
			if (data.stuck_orders.length > 0) {
				let options = {client: [], expedited: [], order_status: []};
				data.stuck_orders.forEach(order => {
					if (!options.client.includes(order.client)) {
						options.client.push(order.client);
					}
					if (!options.expedited.includes(order.expedited)) {
						options.expedited.push(order.expedited);
					}
					if (!options.order_status.includes(order.order_status)) {
						options.order_status.push(order.order_status);
					}
				})
				setFilterOptions(options);
			}
			setOrderData(data);
		});
	}, []);

	useEffect(() => {
		console.log(filters)
	}, [filters]);

	const resetFilters = () => {
		setSearch('')
		setFilters({client: '', expedited: '', order_status: ''});
	};

	const displayRows = () => {
		let filteredOrders = orderData.stuck_orders;
		
		if (filters.client || filters.expedited || filters.order_status) {
			filteredOrders = filteredOrders.filter(order => {
				let match = true;
				if (filters.client && filters.client !== order.client) {
					match = false;
				}
				if (filters.expedited && filters.expedited !== order.expedited.toString()) {
					match = false;
				}
				if (filters.order_status && filters.order_status !== order.order_status) {
					match = false;
				}
				return match;
			});
		}

		if (search) {
			filteredOrders = filteredOrders.filter(order => {
				let match = false;
				if (
					order.client.toLowerCase().includes(search.toLowerCase()) ||
					order.order_number.includes(parseInt(search)) ||
					order.service_number.includes(parseInt(search))
				) {
					match = true;
				}
				return match;
			})
		}


		return filteredOrders.map(order => {
			return (
				<div className='order-detail-row' key={order.order_number}>
					<p className='detail-client'>{order.client}</p>
					<p className='detail-expedited'>{order.expedited.toString()}</p>
					<p className='detail-order-status'>{order.order_status}</p>
					<OverlayTrigger
						trigger={['hover', 'focus']}
						placement="right"
						overlay={
							<Popover id='popover-basic'>
								<Popover.Content>
									<strong style={{ color: '#02818A' }}>Status Age</strong>
									<br/>
									<span>Business Hours: {order.status_change_business_age} hours</span>
									<br/>
									<span>Raw Hours: {order.status_change_raw_age} hours</span>
									<br/>
									<span>Timestamp: {formatDate(new Date(order.status_change_timestamp))}</span>
								</Popover.Content>
							</Popover>
						}
					>
						<p className='detail-status-age'>{order.status_change_business_age} {order.status_change_business_age > 1 ? 'hrs' : 'hr'}</p>
					</OverlayTrigger>
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

	const clientOptions = () => {
		return filterOptions.client.map(option => (
			<option key={option} value={option}>{option}</option>
		))
	};

	const expeditedOptions = () => {
		return filterOptions.expedited.map(option => (
			<option key={option.toString()} value={option.toString()}>{option.toString()}</option>
		))
	};

	const orderStatusOptions = () => {
		return filterOptions.order_status.map(option => (
			<option key={option} value={option}>{option}</option>
		))
	};

	return (
		<div className='details-view-main'>
			<div className='details-view-header'>
				<Link to='/'>
					<i className="fas fa-arrow-left details-back-arrow"></i>
				</Link>
				{
					orderData && filterOptions
					&&
					<div className='details-view-header-right-container'>
						<p onClick={resetFilters}>Reset</p>
						<input onChange={e => setSearch(e.target.value)} type='text' placeholder='Search client, order number, phone' />
					</div>
				}
			</div>
			{
				orderData && filterOptions
				?
				<div className='details-table'>
					<div className='details-table-header'>
						<p className='detail-client'>Client</p>
						<p className='detail-expedited'>Expedited</p>
						<p className='detail-order-status'>Order Status</p>
						<p className='detail-status-age'>Status Age</p>
						<p className='detail-approval-order'>Approval / Order Age</p>
						<p className='detail-subscriber-name'>Subscriber Name</p>
						<p className='detail-service-number'>Service Number</p>
						<p className='detail-order-type'>Order Type</p>
						<p className='detail-make'>Make</p>
						<p className='detail-model'>Model</p>
						<p className='detail-carrier'>Carrier</p>
						<p className='detail-notes'>Notes</p>
					</div>
					<div className='details-table-filter-row'>
						<div className='detail-client'>
							<select name="" id="" value={filters.client} onChange={e => setFilters({ ...filters, client: e.target.value })}>
								<option value="" disabled defaultValue>-- Filter --</option>
								<option value="">(none)</option>
								{ clientOptions() }
							</select>
						</div>
						<div className='detail-expedited'>
							<select name="" id="" value={filters.expedited} onChange={e => setFilters({ ...filters, expedited: e.target.value })}>
								<option value="" disabled defaultValue>-- Filter --</option>
								<option value="">(none)</option>
								{ expeditedOptions() }
							</select>
						</div>
						<div className='detail-order-status'>
							<select name="" id="" value={filters.order_status} onChange={e => setFilters({ ...filters, order_status: e.target.value })}>
								<option value="" disabled defaultValue>-- Filter --</option>
								<option value="">(none)</option>
								{ orderStatusOptions() }
							</select>
						</div>
						<p className='detail-status-age'></p>
						<p className='detail-approval-order'></p>
						<p className='detail-subscriber-name'></p>
						<p className='detail-service-number'></p>
						<p className='detail-order-type'></p>
						<p className='detail-make'></p>
						<p className='detail-model'></p>
						<p className='detail-carrier'></p>
						<p className='detail-notes'></p>
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
