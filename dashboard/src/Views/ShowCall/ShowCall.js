import React, { Fragment } from 'react';
import { Tab, TabbedShowLayout, TextField, FieldTitle, ArrayField, Datagrid, ReferenceArrayField, DateField } from 'react-admin';
import { mapFields } from '../../utils/utils';
import { JsonField, JsonInput } from "react-admin-json-view";

const ShowCall = ({record, ...props}) => {
	const { request, response, id } = record;

	const requestMap = request ? mapFields('request', request) : [];
	const responseMap = response ? mapFields('response', response) : [];

	return (
		<TabbedShowLayout>
			<Tab label='request'>
				<TextField source='id' label='Request ID' />
				<hr/>
        <TextField source='request.method' label='Method' />
        <DateField source='request.time' label='Request Time' />
        <TextField source='request.url' label='URL' />
        <TextField source='request.ip' label='IP' />
        <JsonField source='request.headers' label='Headers' />
			</Tab>
			<Tab label='response'>
				<TextField source='id' label='Request ID' />
				<hr/>
        <TextField source='response.status' label='Status' />
        <DateField source='response.time' label='Response Time' />
        <JsonField source='response.body' label='Body' />
			</Tab>
			<Tab label='logs'>
				<ArrayField source='logs'>
					<Datagrid>
						<TextField source='time'/>
						<TextField source='level'/>
						<TextField source='message'/>
					</Datagrid>
				</ArrayField>
			</Tab>
		</TabbedShowLayout>
	);
};

export default ShowCall;