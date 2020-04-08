import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Dashboard from './views/Dashboard/Dashboard';
import DetailsView from './views/DetailsView/DetailsView';

export default (
	<Switch>
		<Route exact path='/' component={Dashboard} />
		<Route path='/details' component={DetailsView} />
	</Switch>
)