import React, { useState, useEffect } from 'react';
import './DetailsView.scss';
import '../../../node_modules/@fortawesome/fontawesome-free/css/all.css';
import { getOrderData } from '../../App.js';
import { formatDate } from '../../utils.js';

import GridLoader from 'react-spinners/GridLoader';
import { Link } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

export default function DetailsView(props) {
	const [orderData, setOrderData] = useState('');
	const [filterOptions, setFilterOptions] = useState({});
	const [search, setSearch] = useState('');
	const [filters, setFilters] = useState({client: '', expedited: '', order_status: '', alert: ''});
	const [sort, setSort] = useState({ sortBy: '', descending: true });

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
		const alerts = [
			'pending_order_alert',
			'standard_aged_order_alert',
			'expedited_aged_order_alert',
			'standard_approval_alert',
			'expedited_approval_alert'
		];
		if (alerts.includes(props.match.params.alert)) {
			setFilters({client: '', expedited: '', order_status: '', alert: props.match.params.alert});
		}
	}, [props.match.params.alert]);

	const resetFilters = () => {
		setSearch('');
		setFilters({client: '', expedited: '', order_status: '', alert: ''});
	};

	const handleSort = (sortBy) => {
		let descending = true;
		// if user has already sorted by this property before, reverse the sort order
		if (sortBy === sort.sortBy) {
			descending = !sort.descending;
		}
		
		setSort({ sortBy: sortBy, descending: descending });
	};

	const displayRows = () => {
		let filteredOrders = orderData.stuck_orders;
		
		if (filters.client || filters.expedited || filters.order_status || filters.alert) {
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
				if (filters.alert && !order[filters.alert]) {
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

		if (sort.sortBy) {
			filteredOrders = filteredOrders.sort((a, b) => {
				if (sort.descending) {
					if (a[sort.sortBy] < b[sort.sortBy]) return -1;
					if (a[sort.sortBy] > b[sort.sortBy])  return 1;
					return 0;
				} else {
					if (a[sort.sortBy] > b[sort.sortBy]) return -1;
					if (a[sort.sortBy] < b[sort.sortBy])  return 1;
					return 0;
				}
			})
		}

		const splitOrderNum = orderNum => orderNum.toString().split('-')[1];

		return filteredOrders.map(order => {
			return (
				<div className='order-detail-row' key={order.order_number}>
					<p className='detail-client'>{order.client}</p>
					<a href={`https://helpdesk.mobilsense.com/${order.client_db_name}/Popups/OE/orderEdit?order_subscriber_id=${splitOrderNum(order.order_number)}`} target='_blank' rel="noopener noreferrer" className='detail-order-number'>{order.order_number}</a>
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
					<p className='detail-make-model'>{order.make} - {order.model}</p>
					<p className='detail-carrier'>{order.carrier}</p>
					<p className='detail-notes'>{order.notes}</p>
				</div>
			)
		});
	};

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
						<div className='alert-filter-container'>
							<select name="alert-filter" id="alert-filter" value={filters.alert} onChange={e => setFilters({ ...filters, alert: e.target.value })}>
								<option value="" disabled defaultValue>Filter Alert</option>
								<option value="">(none)</option>
								<option value="pending_order_alert">Pending Order</option>
								<option value="standard_aged_order_alert">Standard Aged Order</option>
								<option value="expedited_aged_order_alert">Expedited Aged Order</option>
								<option value="standard_approval_alert">Standard Approval</option>
								<option value="expedited_approval_alert">Expedited Approval</option>
							</select>
						</div>
						<input value={search} onChange={e => setSearch(e.target.value)} type='text' placeholder='Search client, order number, phone' />
					</div>
				}
			</div>
			{
				orderData && filterOptions
				?
				<div className='details-table'>
					<div className='details-table-header'>
						<p onClick={() => handleSort('client')} className='detail-client'>Client</p>
						<p onClick={() => handleSort('order_number')} className='detail-order-number'>Order Number</p>
						<p onClick={() => handleSort('expedited')} className='detail-expedited'>Expedited</p>
						<p onClick={() => handleSort('order_status')} className='detail-order-status'>Order Status</p>
						<p onClick={() => handleSort('status_change_business_age')} className='detail-status-age'>Status Age</p>
						<p onClick={() => handleSort('approval_business_age')} className='detail-approval-order'>Approval / Order Age</p>
						<p onClick={() => handleSort('subscriber_name')} className='detail-subscriber-name'>Subscriber Name</p>
						<p onClick={() => handleSort('service_number')} className='detail-service-number'>Service Number</p>
						<p onClick={() => handleSort('order_type')} className='detail-order-type'>Order Type</p>
						<p onClick={() => handleSort('make')} className='detail-make-model'>Make / Model</p>
						<p onClick={() => handleSort('carrier')} className='detail-carrier'>Carrier</p>
						<p onClick={() => handleSort('notes')} className='detail-notes'>Notes</p>
					</div>
					<div className='details-table-filter-row'>
						<div className='detail-client'>
							<select name="client-filter" id="client-filter" value={filters.client} onChange={e => setFilters({ ...filters, client: e.target.value })}>
								<option value="" disabled defaultValue>Filter</option>
								<option value="">(none)</option>
								{ clientOptions() }
							</select>
						</div>
						<p className='detail-order-number'></p>
						<div className='detail-expedited'>
							<select name="expedited-filter" id="expedited-filter" value={filters.expedited} onChange={e => setFilters({ ...filters, expedited: e.target.value })}>
								<option value="" disabled defaultValue>Filter</option>
								<option value="">(none)</option>
								{ expeditedOptions() }
							</select>
						</div>
						<div className='detail-order-status'>
							<select name="order-status-filter" id="order-status-filter" value={filters.order_status} onChange={e => setFilters({ ...filters, order_status: e.target.value })}>
								<option value="" disabled defaultValue>Filter</option>
								<option value="">(none)</option>
								{ orderStatusOptions() }
							</select>
						</div>
						<p className='detail-status-age'></p>
						<p className='detail-approval-order'></p>
						<p className='detail-subscriber-name'></p>
						<p className='detail-service-number'></p>
						<p className='detail-order-type'></p>
						<p className='detail-make-model'></p>
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
