import React, { useState, useEffect } from 'react';
import './StuckOrdersDetails.scss';
import '../../../node_modules/@fortawesome/fontawesome-free/css/all.css';
import { fetchData, formatDate, formatAge, stuckOrdersUtils } from '../../utils';

import GridLoader from 'react-spinners/GridLoader';
import { Link } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import 'moment-duration-format';
import queryString from 'query-string';
import { CSVLink } from 'react-csv';
import { Tooltip } from '@material-ui/core';

export default function StuckOrdersDetails(props) {
	const [orderData, setOrderData] = useState('');
	const [filterOptions, setFilterOptions] = useState({});
	const [search, setSearch] = useState('');
	const [filters, setFilters] = useState({client: '', expedited: '', order_status: '', alert: '', status_age: '', approval_age: ''});
	const [sort, setSort] = useState({ sortBy: '', descending: true });

	useEffect(() => {
		fetchData('/api/stuck_orders').then(data => {
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
			'expedited_approval_alert',
			'standard_approval_alert',
			'aged_order_gte_72_lt_96_alert',
			'aged_order_gte_96_alert',
		];
		const validDays = ['0', '1', '2', '3', '4', '5', '6', '7', '8+'];
		const queryValues = queryString.parse(props.location.search);

		if (props.location.search) {
			if (alerts.includes(queryValues.alert)) {
				setFilters(filters => {
					return {...filters, alert: queryValues.alert};
				});
			}
			if (queryValues.status_age) {
				let age = queryValues.status_age.trim();
				if (age === '8') {
					age = '8+';
				}
				if (validDays.includes(age)) {
					setFilters(filters => {
						return {...filters, status_age: age};
					});
				}
			}
			if (queryValues.approval_age) {
				let age = queryValues.approval_age.trim();
				if (age === '8') {
					age = '8+';
				}

				if (validDays.includes(age)) {
					setFilters(filters => {
						return {...filters, approval_age: age};
					});
				}
			}
			if (queryValues.client) {
				setFilters(filters => {
					return {...filters, client: queryValues.client};
				});
			}
			if (queryValues.expedited) {
				setFilters(filters => {
					return {...filters, expedited: queryValues.expedited};
				});
			}
		}

	}, [props.location.search]);

	const resetFilters = () => {
		setSearch('');
		setFilters({client: '', expedited: '', order_status: '', alert: '', status_age: '', approval_age: ''});
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
		
		if (filters.client || filters.expedited || filters.order_status || filters.alert || filters.status_age || filters.approval_age) {
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
				if (filters.status_age) {
					const statusAgeInDays = Math.floor(order.status_change_business_age / 24);

					if (filters.status_age === '8+') {
						if (statusAgeInDays < 8) {
							match = false;
						}
					} else {
						if (statusAgeInDays !== parseInt(filters.status_age)) {
							match = false;
						}
					}
				}
				if (filters.approval_age) {
					const approvalAgeInDays = Math.floor(order.approval_business_age / 24);

					if (filters.approval_age === '8+') {
						if (approvalAgeInDays < 8) {
							match = false;
						}
					} else {
						if (approvalAgeInDays !== parseInt(filters.approval_age)) {
							match = false;
						}
					}
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
					<a
						// href={`https://helpdesk.mobilsense.com/${order.client_db_name}/Popups/OE/orderEdit?order_subscriber_id=${splitOrderNum(order.order_number)}`}
						href={`https://helpdesk.mobilsense.com/${order.client_db_name}/api#/app/Utility/order_editor/${splitOrderNum(order.order_number)}`}
						target='_blank'
						rel="noopener noreferrer"
						className='detail-order-number'
					>
						{order.order_number}
					</a>
					<p className='detail-expedited'>{order.expedited && 'Expedited'}</p>
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
						<p className='detail-status-age'>{formatAge(order.status_change_business_age)}</p>
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
						<p className='detail-approval-order' style={{ display: 'inline-block', whiteSpace: 'pre-wrap' }} id={`order-${order.order_number}`}>
							{formatAge(order.approval_business_age)}
							<br/>
							{formatAge(order.order_business_age)}
						</p>
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
			<option key={option.toString()} value={option.toString()}>{option === true ? 'Expedited' : 'Standard'}</option>
		))
	};

	const orderStatusOptions = () => {
		return filterOptions.order_status.map(option => (
			<option key={option} value={option}>{option}</option>
		))
	};

	const daysOptions = () => {
		return (
			<>
				<option value="0">0 Days</option>
				<option value="1">1 Day</option>
				<option value="2">2 Days</option>
				<option value="3">3 Days</option>
				<option value="4">4 Days</option>
				<option value="5">5 Days</option>
				<option value="6">6 Days</option>
				<option value="7">7 Days</option>
				<option value="8+">8+ Days</option>
			</>
		)
	};

	return (
		<div className='details-view-main'>
			<div className='details-view-header'>
				<Link to='/'>
					<i className="fas fa-arrow-left back-arrow"></i>
				</Link>
				{
					orderData && filterOptions
					&&
					<div className='details-view-header-right-container'>
						<Tooltip title='Export Data'>
							<CSVLink data={stuckOrdersUtils.exportDataToCSV(orderData)} filename={stuckOrdersUtils.getFileName()}>
								<i className="fas fa-file-download"></i>
							</CSVLink>
						</Tooltip>
						<Tooltip title='Reset All Filters'>
							<p onClick={resetFilters}>Reset</p>
						</Tooltip>
						<select className='alert-filter' name="alert-filter" id="alert-filter" value={filters.alert} onChange={e => setFilters({ ...filters, alert: e.target.value })}>
							<option value="" disabled defaultValue>Filter Alert</option>
							<option value="">(none)</option>
							<option value="expedited_approval_alert">Exp Approved 4+</option>
							<option value="standard_approval_alert">Std Approved 24+</option>
							<option value="aged_order_gte_72_lt_96_alert">Pending Orders 72+</option>
							<option value="aged_order_gte_96_alert">Pending Orders 96+</option>
						</select>
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
						<div className='detail-status-age'>
							<select name="status-age-filter" id="status-age-filter" value={filters.status_age} onChange={e => setFilters({ ...filters, status_age: e.target.value })}>
								<option value="" disabled defaultValue>Filter</option>
								<option value="">(none)</option>
								{ daysOptions() }
							</select>
						</div>
						<div className='detail-approval-order'>
							<select name="approval-age-filter" id="approval-age-filter" value={filters.approval_age} onChange={e => setFilters({ ...filters, approval_age: e.target.value })}>
								<option value="" disabled defaultValue>Filter</option>
								<option value="">(none)</option>
								{ daysOptions() }
							</select>
						</div>
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
					<GridLoader size={12} loading={true} color={'#02818A'} />
				</div>
			}
		</div>
	)
}
