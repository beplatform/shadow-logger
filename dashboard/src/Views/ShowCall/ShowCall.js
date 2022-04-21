import React from 'react';
import { Tab, TabbedShowLayout, TextField, DateField } from 'react-admin';
import { JsonField } from 'react-admin-json-view';
import ArrayLogs from './ArrayLogs';

const ShowCall = (props) => {
	return (
		<TabbedShowLayout {...props}>
			<Tab label='request'>
				<TextField source='id' label='Request ID' />
				<hr/>
        <TextField source='request.method' label='Method' />
        <DateField source='request.time' label='Request Time' showTime />
        <TextField source='request.url' label='URL' />
        <TextField source='request.ip' label='IP' />
        <JsonField source='request.headers' label='Headers' addLabel={true} reactJsonOptions={{name: null, collapsed: true, displayDataTypes: false}} />
        <JsonField source='request.body' label='Body' addLabel={true} reactJsonOptions={{name: null, collapsed: true, displayDataTypes: false}} />
			</Tab>
			<Tab label='response'>
				<TextField source='id' label='Request ID' />
				<hr/>
        <TextField source='response.status' label='Status' color='red' />
        <DateField source='response.time' label='Response Time' />
        <JsonField source='response.body' label='Body' addLabel={true} reactJsonOptions={{name: null, collapsed: true, displayDataTypes: false}} />
			</Tab>
			<Tab label='logs'>
        <ArrayLogs />
			</Tab>
		</TabbedShowLayout>
	);
};

export default ShowCall;
