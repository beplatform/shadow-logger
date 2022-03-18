import React from 'react';
import { Tab, TabbedShowLayout, TextField } from 'react-admin';

const ShowCall = (props) => {
	console.log(props);
	return (
		<TabbedShowLayout>
			<Tab label='request'>
				<TextField source='id' />
				<TextField source='request.method' label='Method' />
			</Tab>
		</TabbedShowLayout>
	);
};

export default ShowCall;